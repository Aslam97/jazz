import {
    AccountID,
    BinaryStreamInfo,
    CoValueCore,
    JsonValue,
    RawAccount,
    RawBinaryCoStream,
    RawCoStream,
    SessionID,
} from "cojson";
import { CoValueSchema, ID, inspect } from "../../coValueInterfaces.js";
import { Account, ControlledAccount } from "../account/account.js";
import { Group } from "../group/group.js";
import {
    BinaryCoStream,
    BinaryCoStreamSchema,
    CoStream,
    CoStreamSchema,
} from "./coStream.js";
import { SharedCoValueConstructor } from "../construction.js";
import { AST, Schema } from "@effect/schema";
import {
    constructorOfSchemaSym,
    propertyIsCoValueSchema,
} from "../resolution.js";
import { pipeArguments } from "effect/Pipeable";
import { ValueRef } from "../../refs.js";
import { SchemaWithOutput } from "../../schemaHelpers.js";
import {
    SimpleAccount,
    controlledAccountFromNode,
} from "../account/accountOf.js";
import { SimpleGroup } from "../group/groupOf.js";

export function CoStreamOf<
    Item extends CoValueSchema | SchemaWithOutput<JsonValue>,
>(itemSchema: Item) {
    const decodeItem = Schema.decodeSync(itemSchema);
    const encodeItem = Schema.encodeSync(itemSchema);
    const itemIsCoValue = propertyIsCoValueSchema(itemSchema);

    class CoStreamOfItem extends SharedCoValueConstructor {
        static get ast() {
            return AST.setAnnotation(
                Schema.instanceOf(this).ast,
                constructorOfSchemaSym,
                this
            );
        }
        static [Schema.TypeId]: Schema.Schema.Variance<
            CoStreamOfItem,
            CoStreamOfItem,
            never
        >[Schema.TypeId];
        static pipe() {
            // eslint-disable-next-line prefer-rest-params
            return pipeArguments(this, arguments);
        }
        static type = "CoStream" as const;

        id!: ID<this>;
        _type!: "CoStream";
        _owner!: Account | Group;
        _refs!: CoStream<Item>["_refs"];
        _raw!: RawCoStream;
        _loadedAs!: ControlledAccount;
        _schema!: typeof CoStreamOfItem;

        by: {
            [key: ID<Account>]: Schema.Schema.To<Item>;
        };
        in: {
            [key: SessionID]: Schema.Schema.To<Item>;
        };

        constructor(
            init: Schema.Schema.To<Item>[] | undefined,
            options: { owner: Account | Group } | { fromRaw: RawCoStream }
        ) {
            super();

            let raw: RawCoStream;

            if ("fromRaw" in options) {
                raw = options.fromRaw;
            } else {
                const rawOwner = options.owner._raw;

                raw = rawOwner.createStream();
            }

            const byRefs: {
                [key: ID<Account>]: Item extends CoValueSchema<
                    infer _,
                    infer Value
                >
                    ? ValueRef<Value>
                    : never;
            } = {};
            const inRefs: {
                [key: SessionID]: Item extends CoValueSchema<
                    infer _,
                    infer Value
                >
                    ? ValueRef<Value>
                    : never;
            } = {};

            this.by = {};
            this.in = {};

            Object.defineProperties(this, {
                id: { value: raw.id, enumerable: false },
                _type: { value: "CoStream", enumerable: false },
                _owner: {
                    get: () =>
                        raw.group instanceof RawAccount
                            ? SimpleAccount.fromRaw(raw.group)
                            : SimpleGroup.fromRaw(raw.group),
                    enumerable: false,
                },
                _refs: {
                    value: {
                        by: byRefs,
                        in: inRefs,
                    },
                    enumerable: false,
                },
                _raw: { value: raw, enumerable: false },
                _loadedAs: {
                    get: () => controlledAccountFromNode(raw.core.node),
                    enumerable: false,
                },
                _schema: { value: this.constructor, enumerable: false },
            });

            if (init !== undefined) {
                for (const item of init) {
                    this.pushItem(item);
                }
            }

            this.updateEntries();
        }

        private updateEntries() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            const raw = this._raw;
            const loadedAs = this._loadedAs;
            const refs = this._refs;

            if (itemIsCoValue) {
                for (const accountID of this._raw.accounts() as unknown as Set<
                    ID<Account>
                >) {
                    if (Object.hasOwn(refs.by, accountID)) continue;
                    Object.defineProperty(refs.by, accountID, {
                        get() {
                            const rawId = raw.lastItemBy(
                                accountID as unknown as AccountID
                            )?.value;
                            return new ValueRef(
                                rawId as unknown as ID<Schema.Schema.To<Item>>,
                                loadedAs,
                                itemSchema
                            );
                        },
                    });

                    Object.defineProperty(this.by, accountID, {
                        get() {
                            return refs.by[accountID]?.accessFrom(self);
                        },
                    });
                }

                for (const sessionID of raw.sessions() as unknown as Set<SessionID>) {
                    if (Object.hasOwn(refs.in, sessionID)) continue;
                    Object.defineProperty(refs.in, sessionID, {
                        get() {
                            const rawId = raw.lastItemIn(
                                sessionID as unknown as SessionID
                            )?.value;
                            return new ValueRef(
                                rawId as unknown as ID<Schema.Schema.To<Item>>,
                                loadedAs,
                                itemSchema
                            );
                        },
                    });

                    Object.defineProperty(this.in, sessionID, {
                        get() {
                            return refs.in[sessionID]?.accessFrom(self);
                        },
                    });
                }
            } else {
                for (const accountID of raw.accounts() as unknown as Set<
                    ID<Account>
                >) {
                    if (Object.hasOwn(this.by, accountID)) continue;
                    Object.defineProperty(this.by, accountID, {
                        get() {
                            const rawItem = raw.lastItemBy(
                                accountID as unknown as AccountID
                            )?.value;
                            return rawItem && decodeItem(rawItem);
                        },
                    });
                }

                for (const sessionID of raw.sessions() as unknown as Set<SessionID>) {
                    if (Object.hasOwn(this.in, sessionID)) continue;
                    Object.defineProperty(this.in, sessionID, {
                        get() {
                            const rawItem = raw.lastItemIn(
                                sessionID as unknown as SessionID
                            )?.value;
                            return rawItem && decodeItem(rawItem);
                        },
                    });
                }
            }
        }

        static fromRaw(raw: RawCoStream) {
            return new CoStreamOfItem(undefined, { fromRaw: raw });
        }

        push(...items: Schema.Schema.To<Item>[]) {
            for (const item of items) {
                this.pushItem(item);
            }
            this.updateEntries();
        }

        private pushItem(item: Schema.Schema.To<Item>) {
            if (itemIsCoValue) {
                this._raw.push(item.id);
            } else {
                this._raw.push(encodeItem(item));
            }
        }

        toJSON() {
            return {
                by: Object.fromEntries(
                    Object.entries(this.by).map(([key, value]) => [
                        key,
                        value &&
                        typeof value === "object" &&
                        "toJSON" in value &&
                        typeof value.toJSON === "function"
                            ? value.toJSON()
                            : value,
                    ])
                ),
                in: Object.fromEntries(
                    Object.entries(this.in).map(([key, value]) => [
                        key,
                        value &&
                        typeof value === "object" &&
                        "toJSON" in value &&
                        typeof value.toJSON === "function"
                            ? value.toJSON()
                            : value,
                    ])
                ),
                co: {
                    id: this.id,
                    type: "CoStream",
                },
            };
        }

        [inspect]() {
            return this.toJSON();
        }

        static as<SubClass>() {
            return CoStreamOfItem as unknown as CoStreamSchema<SubClass, Item>;
        }
    }

    return CoStreamOfItem as CoStreamSchema<CoStreamOfItem, Item> & {
        as<SubClass>(): CoStreamSchema<SubClass, Item>;
    };
}

class BinaryCoStreamImplClass
    extends SharedCoValueConstructor
    implements BinaryCoStream
{
    static ast = AST.setAnnotation(
        Schema.instanceOf(this).ast,
        constructorOfSchemaSym,
        this
    );
    static [Schema.TypeId]: Schema.Schema.Variance<
        BinaryCoStream,
        BinaryCoStream,
        never
    >[Schema.TypeId];
    static pipe() {
        // eslint-disable-next-line prefer-rest-params
        return pipeArguments(this, arguments);
    }
    static type = "BinaryCoStream" as const;

    id!: ID<this>;
    _type!: "BinaryCoStream";
    _owner!: Account | Group;
    _raw!: RawBinaryCoStream;
    _loadedAs!: ControlledAccount;
    _schema!: typeof BinaryCoStreamImplClass;

    constructor(
        init: [] | undefined,
        options:
            | {
                  owner: Account | Group;
              }
            | {
                  fromRaw: RawBinaryCoStream;
              }
    ) {
        super();

        let raw: RawBinaryCoStream;

        if ("fromRaw" in options) {
            raw = options.fromRaw;
        } else {
            const rawOwner = options.owner._raw;

            raw = rawOwner.createBinaryStream();
        }

        Object.defineProperties(this, {
            id: { value: raw.id, enumerable: false },
            _type: { value: "BinaryCoStream", enumerable: false },
            _owner: {
                get: () =>
                    raw.group instanceof RawAccount
                        ? SimpleAccount.fromRaw(raw.group)
                        : SimpleGroup.fromRaw(raw.group),
                enumerable: false,
            },
            _raw: { value: raw, enumerable: false },
            _loadedAs: {
                get: () => controlledAccountFromNode(raw.core.node),
                enumerable: false,
            },
            _schema: { value: this.constructor, enumerable: false },
        });
    }

    static fromRaw(raw: RawBinaryCoStream) {
        return new BinaryCoStreamImplClass(undefined, { fromRaw: raw });
    }

    getChunks(options?: {
        allowUnfinished?: boolean;
    }):
        | (BinaryStreamInfo & { chunks: Uint8Array[]; finished: boolean })
        | undefined {
        return this._raw.getBinaryChunks(options?.allowUnfinished);
    }

    start(options: BinaryStreamInfo): void {
        this._raw.startBinaryStream(options);
    }

    push(data: Uint8Array): void {
        this._raw.pushBinaryStreamChunk(data);
    }

    end(): void {
        this._raw.endBinaryStream();
    }

    toJSON(): object | any[] {
        return {
            ...this.getChunks(),
            co: {
                id: this.id,
                type: "BinaryCoStream",
            },
        };
    }

    [inspect]() {
        return this.toJSON();
    }
}

export const BinaryCoStreamImpl =
    BinaryCoStreamImplClass as BinaryCoStreamSchema;
