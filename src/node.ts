import { createdNowUnique, newRandomKeySecret, seal } from './crypto.js';
import {
    CoValue,
    AgentCredential,
    Agent,
    getAgent,
    getAgentID,
    getAgentCoValueHeader,
    CoValueHeader,
    newRandomAgentCredential,
} from './coValue.js';
import { Team, expectTeamContent } from './permissions.js';
import { SyncManager } from './sync.js';
import { AgentID, RawCoValueID, SessionID } from './ids.js';
import { CoValueID, ContentType } from './contentType.js';

export class LocalNode {
    coValues: { [key: RawCoValueID]: CoValueState } = {};
    agentCredential: AgentCredential;
    agentID: AgentID;
    ownSessionID: SessionID;
    sync = new SyncManager(this);

    constructor(agentCredential: AgentCredential, ownSessionID: SessionID) {
        this.agentCredential = agentCredential;
        const agent = getAgent(agentCredential);
        const agentID = getAgentID(agent);
        this.agentID = agentID;
        this.ownSessionID = ownSessionID;

        const agentCoValue = new CoValue(getAgentCoValueHeader(agent), this);
        this.coValues[agentCoValue.id] = {
            state: "loaded",
            coValue: agentCoValue,
        };
    }

    createCoValue(header: CoValueHeader): CoValue {
        const coValue = new CoValue(header, this);
        this.coValues[coValue.id] = { state: "loaded", coValue: coValue };

        void this.sync.syncCoValue(coValue);

        return coValue;
    }

    loadCoValue(id: RawCoValueID): Promise<CoValue> {
        let entry = this.coValues[id];
        if (!entry) {
            entry = newLoadingState();

            this.coValues[id] = entry;

            this.sync.loadFromPeers(id);
        }
        if (entry.state === "loaded") {
            return Promise.resolve(entry.coValue);
        }
        return entry.done;
    }

    async load<T extends ContentType>(id: CoValueID<T>): Promise<T> {
        return (await this.loadCoValue(id)).getCurrentContent() as T;
    }

    expectCoValueLoaded(id: RawCoValueID, expectation?: string): CoValue {
        const entry = this.coValues[id];
        if (!entry) {
            throw new Error(
                `${expectation ? expectation + ": " : ""}Unknown CoValue ${id}`
            );
        }
        if (entry.state === "loading") {
            throw new Error(
                `${
                    expectation ? expectation + ": " : ""
                }CoValue ${id} not yet loaded`
            );
        }
        return entry.coValue;
    }

    createAgent(publicNickname: string): AgentCredential {
        const agentCredential = newRandomAgentCredential(publicNickname);

        this.createCoValue(getAgentCoValueHeader(getAgent(agentCredential)));

        return agentCredential;
    }

    expectAgentLoaded(id: AgentID, expectation?: string): Agent {
        const coValue = this.expectCoValueLoaded(
            id,
            expectation
        );

        if (coValue.header.type !== "comap" || coValue.header.ruleset.type !== "agent") {
            throw new Error(
                `${
                    expectation ? expectation + ": " : ""
                }CoValue ${id} is not an agent`
            );
        }

        return {
            recipientID: coValue.header.ruleset.initialRecipientID,
            signatoryID: coValue.header.ruleset.initialSignatoryID,
            publicNickname: coValue.header.publicNickname?.replace("agent-", ""),
        }
    }

    createTeam(): Team {
        const teamCoValue = this.createCoValue({
            type: "comap",
            ruleset: { type: "team", initialAdmin: this.agentID },
            meta: null,
            ...createdNowUnique(),
            publicNickname: "team",
        });

        let teamContent = expectTeamContent(teamCoValue.getCurrentContent());

        teamContent = teamContent.edit((editable) => {
            editable.set(this.agentID, "admin", "trusting");

            const readKey = newRandomKeySecret();
            const revelation = seal(
                readKey.secret,
                this.agentCredential.recipientSecret,
                new Set([getAgent(this.agentCredential).recipientID]),
                {
                    in: teamCoValue.id,
                    tx: teamCoValue.nextTransactionID(),
                }
            );

            editable.set(
                "readKey",
                { keyID: readKey.id, revelation },
                "trusting"
            );
        });

        return new Team(teamContent, this);
    }

    testWithDifferentCredentials(
        agentCredential: AgentCredential,
        ownSessionID: SessionID
    ): LocalNode {
        const newNode = new LocalNode(agentCredential, ownSessionID);

        newNode.coValues = Object.fromEntries(
            Object.entries(this.coValues)
                .map(([id, entry]) => {
                    if (entry.state === "loading") {
                        return undefined;
                    }

                    const newCoValue = new CoValue(
                        entry.coValue.header,
                        newNode
                    );

                    newCoValue.sessions = entry.coValue.sessions;

                    return [id, { state: "loaded", coValue: newCoValue }];
                })
                .filter((x): x is Exclude<typeof x, undefined> => !!x)
        );

        return newNode;
    }
}

type CoValueState =
    | {
          state: "loading";
          done: Promise<CoValue>;
          resolve: (coValue: CoValue) => void;
      }
    | { state: "loaded"; coValue: CoValue };

export function newLoadingState(): CoValueState {
    let resolve: (coValue: CoValue) => void;

    const promise = new Promise<CoValue>((r) => {
        resolve = r;
    });

    return {
        state: "loading",
        done: promise,
        resolve: resolve!,
    };
}
