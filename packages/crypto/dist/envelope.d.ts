import { TxSecureRecord, DecryptError } from "./types";
export declare class EnvelopeEncryption {
    private masterKey;
    constructor(masterKey: Buffer);
    /**
     * Encrypts a payload using envelope encryption
     */
    encryptPayload(payload: object, partyId: string): TxSecureRecord;
    /**
     * Decrypts a TxSecureRecord
     */
    decryptPayload(record: TxSecureRecord): object | DecryptError;
}
//# sourceMappingURL=envelope.d.ts.map