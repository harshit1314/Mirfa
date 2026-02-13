import { TxSecureRecord } from "@mirfa/crypto";
export declare class TxStore {
    private store;
    save(record: TxSecureRecord): void;
    get(id: string): TxSecureRecord | undefined;
    getByPartyId(partyId: string): TxSecureRecord[];
    exists(id: string): boolean;
    delete(id: string): boolean;
    clear(): void;
    size(): number;
}
