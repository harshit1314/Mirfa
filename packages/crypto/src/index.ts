import * as crypto from "node:crypto";

export type TxSecureRecord = {
    id: string;
    partyId: string;
    createdAt: string;
    payload_nonce: string;
    payload_ct: string;
    payload_tag: string;
    dek_wrap_nonce: string;
    dek_wrapped: string;
    dek_wrap_tag: string;
    alg: "AES-256-GCM";
    mk_version: 1;
};

const ALG = "aes-256-gcm";
const NONCE_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;

/**
 * Validates hex string and length
 */
function validateHex(hex: string, expectedBytes: number, name: string) {
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
        throw new Error(`Invalid hex for ${name}`);
    }
    if (Buffer.from(hex, "hex").length !== expectedBytes) {
        throw new Error(`Invalid length for ${name}: expected ${expectedBytes} bytes but got ${Buffer.from(hex, "hex").length}`);
    }
}

/**
 * Encrypts data with a key
 */
function encrypt(data: Buffer, key: Buffer): { ct: string; nonce: string; tag: string } {
    const nonce = crypto.randomBytes(NONCE_LEN);
    const cipher = crypto.createCipheriv(ALG, key, nonce);
    const ct = Buffer.concat([cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
        ct: ct.toString("hex"),
        nonce: nonce.toString("hex"),
        tag: tag.toString("hex"),
    };
}

/**
 * Decrypts data with a key
 */
function decrypt(ctHex: string, key: Buffer, nonceHex: string, tagHex: string): Buffer {
    validateHex(nonceHex, NONCE_LEN, "nonce");
    validateHex(tagHex, TAG_LEN, "tag");

    const nonce = Buffer.from(nonceHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const ct = Buffer.from(ctHex, "hex");

    const decipher = crypto.createDecipheriv(ALG, key, nonce);
    decipher.setAuthTag(tag);

    try {
        return Buffer.concat([decipher.update(ct), decipher.final()]);
    } catch (err) {
        throw new Error("Decryption failed: Ciphertext or tag may have been tampered with");
    }
}

/**
 * Envelope Encryption: Encrypt payload and wrap DEK
 */
export function seal(
    partyId: string,
    payload: any,
    masterKey: string
): Omit<TxSecureRecord, "id" | "createdAt"> {
    const mkBuffer = Buffer.from(masterKey, "hex");
    if (mkBuffer.length !== KEY_LEN) {
        throw new Error(`Master key must be ${KEY_LEN} bytes (64 hex characters)`);
    }

    // 1. Generate DEK
    const dek = crypto.randomBytes(KEY_LEN);

    // 2. Encrypt payload
    const payloadBuffer = Buffer.from(JSON.stringify(payload));
    const { ct: payload_ct, nonce: payload_nonce, tag: payload_tag } = encrypt(payloadBuffer, dek);

    // 3. Wrap DEK
    const { ct: dek_wrapped, nonce: dek_wrap_nonce, tag: dek_wrap_tag } = encrypt(dek, mkBuffer);

    return {
        partyId,
        payload_nonce,
        payload_ct,
        payload_tag,
        dek_wrap_nonce,
        dek_wrapped,
        dek_wrap_tag,
        alg: "AES-256-GCM",
        mk_version: 1,
    };
}

/**
 * Envelope Decryption: Unwrap DEK and decrypt payload
 */
export function unseal(record: TxSecureRecord, masterKey: string): any {
    const mkBuffer = Buffer.from(masterKey, "hex");
    if (mkBuffer.length !== KEY_LEN) {
        throw new Error(`Master key must be ${KEY_LEN} bytes (64 hex characters)`);
    }

    // 1. Unwrap DEK
    const dek = decrypt(record.dek_wrapped, mkBuffer, record.dek_wrap_nonce, record.dek_wrap_tag);

    // 2. Decrypt payload
    const payloadBuffer = decrypt(record.payload_ct, dek, record.payload_nonce, record.payload_tag);

    return JSON.parse(payloadBuffer.toString());
}
