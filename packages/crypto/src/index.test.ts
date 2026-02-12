import { describe, it, expect } from "vitest";
import { seal, unseal, type TxSecureRecord } from "./index";
import * as crypto from "node:crypto";

const MASTER_KEY = crypto.randomBytes(32).toString("hex");

describe("packages/crypto", () => {
    const payload = { amount: 100, currency: "AED" };
    const partyId = "party_123";

    it("should encrypt and decrypt a payload successfully", () => {
        const record = seal(partyId, payload, MASTER_KEY) as TxSecureRecord;

        expect(record.partyId).toBe(partyId);
        expect(record.alg).toBe("AES-256-GCM");
        expect(record.mk_version).toBe(1);

        const decrypted = unseal(record, MASTER_KEY);
        expect(decrypted).toEqual(payload);
    });

    it("should fail to decrypt if ciphertext is tampered", () => {
        const record = seal(partyId, payload, MASTER_KEY) as TxSecureRecord;
        // Tamper with payload_ct
        record.payload_ct = record.payload_ct.slice(0, -2) + (record.payload_ct.endsWith("0") ? "1" : "0");

        expect(() => unseal(record, MASTER_KEY)).toThrow("Decryption failed");
    });

    it("should fail to decrypt if tag is tampered", () => {
        const record = seal(partyId, payload, MASTER_KEY) as TxSecureRecord;
        // Tamper with payload_tag (change last hex char instead of removing and adding one)
        const originalTag = record.payload_tag;
        const lastChar = originalTag.slice(-1);
        const newLastChar = lastChar === "0" ? "1" : "0";
        record.payload_tag = originalTag.slice(0, -1) + newLastChar;

        expect(() => unseal(record, MASTER_KEY)).toThrow("Decryption failed");
    });

    it("should fail if nonce length is invalid", () => {
        const record = seal(partyId, payload, MASTER_KEY) as TxSecureRecord;
        record.payload_nonce = record.payload_nonce + "ff"; // 13 bytes instead of 12

        expect(() => unseal(record, MASTER_KEY)).toThrow("Invalid length for nonce");
    });

    it("should fail if wrong master key is used", () => {
        const record = seal(partyId, payload, MASTER_KEY) as TxSecureRecord;
        const WRONG_KEY = crypto.randomBytes(32).toString("hex");

        expect(() => unseal(record, WRONG_KEY)).toThrow("Decryption failed");
    });
});
