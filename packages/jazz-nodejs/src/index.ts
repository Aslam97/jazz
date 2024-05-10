import {
    websocketReadableStream,
    websocketWritableStream,
} from "cojson-transport-nodejs-ws";
import { WebSocket } from "ws";
import "dotenv/config";

import { webcrypto } from "node:crypto";
import {
    AccountID,
    AgentSecret,
    Peer,
    SessionID,
    cojsonInternals,
    cojsonReady,
} from "cojson";
import { Account, CoValueClass, ID, Me } from "jazz-tools";

if (!("crypto" in globalThis)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).crypto = webcrypto;
}

/** @category Context Creation */
export async function startWorker<A extends Account>({
    accountID = process.env.JAZZ_WORKER_ACCOUNT,
    accountSecret = process.env.JAZZ_WORKER_SECRET,
    sessionID = process.env.JAZZ_WORKER_SESSION,
    syncServer: peer = "wss://sync.jazz.tools",
    accountSchema = Account as unknown as CoValueClass<A> & typeof Account,
}: {
    accountID?: string,
    accountSecret?: string,
    sessionID?: string,
    syncServer?: string;
    accountSchema?: CoValueClass<A> & typeof Account;
}): Promise<{ worker: A & Me }> {
    await cojsonReady;

    const ws = new WebSocket(peer);

    const wsPeer: Peer = {
        id: "upstream",
        role: "server",
        incoming: websocketReadableStream(ws),
        outgoing: websocketWritableStream(ws),
    };

    // TODO: locked sessions similar to browser
    const sessionIDToUse =
        sessionID ||
        cojsonInternals.newRandomSessionID(
            accountID as AccountID
        );

    if (!accountID) {
        throw new Error("No accountID provided");
    }
    if (!accountSecret) {
        throw new Error("No accountSecret provided");
    }
    if (!sessionIDToUse) {
        throw new Error("No sessionID provided");
    }
    if (!accountID.startsWith("co_")) {
        throw new Error("Invalid accountID");
    }
    if (!accountSecret?.startsWith("sealerSecret_")) {
        throw new Error("Invalid accountSecret");
    }
    if (!sessionIDToUse.startsWith("co_") || !sessionIDToUse.includes("_session")) {
        throw new Error("Invalid sessionID");
    }

    const worker = await accountSchema.become({
        accountID: accountID as ID<A>,
        accountSecret: accountSecret as AgentSecret,
        sessionID: sessionIDToUse as SessionID,
        peersToLoadFrom: [wsPeer],
    });

    setInterval(() => {
        if (!worker._raw.core.node.syncManager.peers["upstream"]) {
            console.log(new Date(), "Reconnecting to upstream " + peer);
            const ws = new WebSocket(peer);

            const wsPeer: Peer = {
                id: "upstream",
                role: "server",
                incoming: websocketReadableStream(ws),
                outgoing: websocketWritableStream(ws),
            };

            worker._raw.core.node.syncManager.addPeer(wsPeer);
        }
    }, 5000);

    return { worker: worker as A & Me };
}
