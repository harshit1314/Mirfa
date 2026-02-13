import { randomUUID } from "crypto";
import {
  encrypt,
  decrypt,
  generateDEK,
  wrapDEK,
  unwrapDEK,
} from "./encryption";
import { TxSecureRecord, EncryptedPayload, DecryptError } from "./types";

const ERROR_CODES: Set<string> = new Set([
  "INVALID_NONCE_LENGTH",
  "INVALID_TAG_LENGTH",
  "INVALID_HEX",
  "DECRYPTION_FAILED",
  "AUTHENTICATION_FAILED",
]);

function isDecryptError(value: string): value is DecryptError {
  return ERROR_CODES.has(value);
}

export class EnvelopeEncryption {
  constructor(private masterKey: Buffer) {}

  /**
   * Encrypts a payload using envelope encryption
   */
  encryptPayload(payload: object, partyId: string): TxSecureRecord {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    // Step 1: Generate random DEK
    const dek = generateDEK();

    // Step 2: Encrypt payload using DEK
    const payloadJson = JSON.stringify(payload);
    const encryptedPayload = encrypt(payloadJson, dek);

    // Step 3: Wrap DEK using Master Key
    const wrappedDEK = wrapDEK(dek, this.masterKey);

    // Return structured record
    return {
      id,
      partyId,
      createdAt,
      payload_nonce: encryptedPayload.nonce,
      payload_ct: encryptedPayload.ciphertext,
      payload_tag: encryptedPayload.tag,
      dek_wrap_nonce: wrappedDEK.nonce,
      dek_wrapped: wrappedDEK.ciphertext,
      dek_wrap_tag: wrappedDEK.tag,
      alg: "AES-256-GCM",
      mk_version: 1,
    };
  }

  /**
   * Decrypts a TxSecureRecord
   */
  decryptPayload(
    record: TxSecureRecord
  ): object | DecryptError {
    // Step 1: Unwrap DEK using Master Key
    const wrappedData: EncryptedPayload = {
      nonce: record.dek_wrap_nonce,
      ciphertext: record.dek_wrapped,
      tag: record.dek_wrap_tag,
    };

    const dekResult = unwrapDEK(wrappedData, this.masterKey);
    if (typeof dekResult === "string") {
      return dekResult as DecryptError;
    }

    const dek = dekResult;

    // Step 2: Decrypt payload using DEK
    const encryptedPayload: EncryptedPayload = {
      nonce: record.payload_nonce,
      ciphertext: record.payload_ct,
      tag: record.payload_tag,
    };

    const payloadJsonResult = decrypt(encryptedPayload, dek);
    if (typeof payloadJsonResult === "string" && isDecryptError(payloadJsonResult)) {
      return payloadJsonResult;
    }

    // Step 3: Parse JSON
    try {
      return JSON.parse(payloadJsonResult);
    } catch {
      return "DECRYPTION_FAILED" as DecryptError;
    }
  }
}
