import { EncryptedPayload, DecryptError } from "./types";
/**
 * Validates nonce length
 */
export declare function validateNonce(nonce: string): boolean;
/**
 * Validates tag length
 */
export declare function validateTag(tag: string): boolean;
/**
 * Validates hex string
 */
export declare function isValidHex(hex: string): boolean;
/**
 * Encrypts plaintext using AES-256-GCM
 */
export declare function encrypt(plaintext: string, key: Buffer, nonce?: Buffer): EncryptedPayload;
/**
 * Decrypts ciphertext using AES-256-GCM
 */
export declare function decrypt(encrypted: EncryptedPayload, key: Buffer): string | DecryptError;
/**
 * Generates a random Master Key (32 bytes for AES-256)
 */
export declare function generateMasterKey(): Buffer;
/**
 * Generates a random Data Encryption Key (32 bytes for AES-256)
 */
export declare function generateDEK(): Buffer;
/**
 * Wraps a DEK using the master key
 */
export declare function wrapDEK(dek: Buffer, masterKey: Buffer, nonce?: Buffer): EncryptedPayload;
/**
 * Unwraps a wrapped DEK using the master key
 */
export declare function unwrapDEK(wrappedData: EncryptedPayload, masterKey: Buffer): Buffer | DecryptError;
//# sourceMappingURL=encryption.d.ts.map