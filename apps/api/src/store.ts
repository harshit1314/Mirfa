import { TxSecureRecord } from "@mirfa/crypto";

export class TxStore {
  private store: Map<string, TxSecureRecord> = new Map();

  save(record: TxSecureRecord): void {
    this.store.set(record.id, record);
  }

  get(id: string): TxSecureRecord | undefined {
    return this.store.get(id);
  }

  getByPartyId(partyId: string): TxSecureRecord[] {
    const results: TxSecureRecord[] = [];
    for (const record of this.store.values()) {
      if (record.partyId === partyId) {
        results.push(record);
      }
    }
    return results;
  }

  exists(id: string): boolean {
    return this.store.has(id);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
