export class TxStore {
    constructor() {
        Object.defineProperty(this, "store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    save(record) {
        this.store.set(record.id, record);
    }
    get(id) {
        return this.store.get(id);
    }
    getByPartyId(partyId) {
        const results = [];
        for (const record of this.store.values()) {
            if (record.partyId === partyId) {
                results.push(record);
            }
        }
        return results;
    }
    exists(id) {
        return this.store.has(id);
    }
    delete(id) {
        return this.store.delete(id);
    }
    clear() {
        this.store.clear();
    }
    size() {
        return this.store.size;
    }
}
//# sourceMappingURL=store.js.map