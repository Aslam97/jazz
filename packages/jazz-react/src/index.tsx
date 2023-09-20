import {
    LocalNode,
    CoID,
    BinaryCoStream,
    BinaryCoStreamMeta,
    Queried,
    CoValue
} from "cojson";
import React, { useEffect, useState } from "react";
import { AuthProvider, createBrowserNode } from "jazz-browser";
import { readBlobFromBinaryStream } from "jazz-browser";

export {
    createInviteLink,
    parseInviteLink,
    consumeInviteLinkFromWindowLocation,
} from "jazz-browser";

type JazzContext = {
    localNode: LocalNode;
    logOut: () => void;
};

const JazzContext = React.createContext<JazzContext | undefined>(undefined);

export type ReactAuthHook = () => {
    auth: AuthProvider;
    AuthUI: React.ReactNode;
    logOut?: () => void;
};

export function WithJazz({
    children,
    auth: authHook,
    syncAddress,
}: {
    children: React.ReactNode;
    auth: ReactAuthHook;
    syncAddress?: string;
}) {
    const [node, setNode] = useState<LocalNode | undefined>();

    const { auth, AuthUI, logOut } = authHook();

    useEffect(() => {
        let done: (() => void) | undefined = undefined;
        let stop = false;

        (async () => {
            const nodeHandle = await createBrowserNode({
                auth: auth,
                syncAddress:
                    syncAddress ||
                    new URLSearchParams(window.location.search).get("sync") ||
                    undefined,
            });

            if (stop) {
                nodeHandle.done();
                return;
            }

            setNode(nodeHandle.node);

            done = nodeHandle.done;
        })().catch((e) => {
            console.log("Failed to create browser node", e);
        });

        return () => {
            stop = true;
            done && done();
        };
    }, [auth, syncAddress]);

    return (
        <>
            {node && logOut ? (
                <JazzContext.Provider value={{ localNode: node, logOut }}>
                    <>{children}</>
                </JazzContext.Provider>
            ) : (
                AuthUI
            )}
        </>
    );
}

export function useJazz() {
    const context = React.useContext(JazzContext);

    if (!context) {
        throw new Error("useJazz must be used within a WithJazz provider");
    }

    return context;
}

/** @deprecated Use the higher-level `useSyncedQuery` or the equivalent `useSyncedValue` instead */
export function useTelepathicState<T extends CoValue>(id?: CoID<T>) {
    return useSyncedValue(id);
}

export function useSyncedValue<T extends CoValue>(id?: CoID<T>) {
    const [state, setState] = useState<T>();

    const { localNode } = useJazz();

    useEffect(() => {
        if (!id) return;
        let unsubscribe: (() => void) | undefined = undefined;

        let done = false;

        localNode
            .load(id)
            .then((state) => {
                if (done) return;
                unsubscribe = state.subscribe((newState) => {
                    // console.log(
                    //     "Got update",
                    //     id,
                    //     newState.toJSON(),
                    // );
                    setState(newState as T);
                });
            })
            .catch((e) => {
                console.log("Failed to load", id, e);
            });

        return () => {
            done = true;
            unsubscribe && unsubscribe();
        };
    }, [localNode, id]);

    return state;
}

export function useSyncedQuery<T extends CoValue>(
    id?: CoID<T>
): Queried<T> | undefined {
    const { localNode } = useJazz();

    const [result, setResult] = useState<Queried<T> | undefined>();

    useEffect(() => {
        if (!id) return;
        const unsubscribe = localNode.query(id, setResult);
        return unsubscribe;
    }, [id, localNode]);

    return result;
}

export function useBinaryStream<C extends BinaryCoStream<BinaryCoStreamMeta>>(
    streamID?: CoID<C>,
    allowUnfinished?: boolean
): { blob: Blob; blobURL: string } | undefined {
    const { localNode } = useJazz();

    const stream = useTelepathicState(streamID);

    const [blob, setBlob] = useState<
        { blob: Blob; blobURL: string } | undefined
    >();

    useEffect(() => {
        if (!stream) return;
        readBlobFromBinaryStream(stream.id, localNode, allowUnfinished)
            .then((blob) =>
                setBlob(
                    blob && {
                        blob,
                        blobURL: URL.createObjectURL(blob),
                    }
                )
            )
            .catch((e) => console.error("Failed to read binary stream", e));
    }, [stream, localNode]);

    useEffect(() => {
        return () => {
            blob && URL.revokeObjectURL(blob.blobURL);
        };
    }, [blob?.blobURL]);

    return blob;
}
