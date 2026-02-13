import crypto from "crypto";
const ALGORITHM = "aes-256-gcm";
const NONCE_LENGTH = 12; // bytes
const TAG_LENGTH = 16; // bytes
const DEK_LENGTH = 32; // bytes for AES-256
/**
 * Validates nonce length
 */
export function validateNonce(nonce) {
    try {
        const buffer = Buffer.from(nonce, "hex");
        return buffer.length === NONCE_LENGTH;
    }
    catch {
        return false;
    }
}
/**
 * Validates tag length
 */
export function validateTag(tag) {
    try {
        const buffer = Buffer.from(tag, "hex");
        return buffer.length === TAG_LENGTH;
    }
    catch {
        return false;
    }
}
/**
 * Validates hex string
 */
export function isValidHex(hex) {
    return /^[a-f0-9]*$/i.test(hex);
}
/**
 * Encrypts plaintext using AES-256-GCM
 */
export function encrypt(plaintext, key, nonce) {
    // Generate random nonce if not provided (12 bytes)
    const nonceBuffer = nonce || crypto.randomBytes(NONCE_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, nonceBuffer);
    const ciphertextBuffer = cipher.update(plaintext, "utf-8");
    cipher.final();
    const tag = cipher.getAuthTag();
    return {
        nonce: nonceBuffer.toString("hex"),
        ciphertext: ciphertextBuffer.toString("hex"),
        tag: tag.toString("hex"),
    };
}
/**
 * Decrypts ciphertext using AES-256-GCM
 */
export function decrypt(encrypted, key) {
    // Validate nonce
    if (!validateNonce(encrypted.nonce)) {
        return "INVALID_NONCE_LENGTH";
    }
    // Validate tag
    if (!validateTag(encrypted.tag)) {
        return "INVALID_TAG_LENGTH";
    }
    // Validate hex
    if (!isValidHex(encrypted.nonce) ||
        !isValidHex(encrypted.ciphertext) ||
        !isValidHex(encrypted.tag)) {
        return "INVALID_HEX";
    }
    try {
        const nonceBuffer = Buffer.from(encrypted.nonce, "hex");
        const ciphertextBuffer = Buffer.from(encrypted.ciphertext, "hex");
        const tagBuffer = Buffer.from(encrypted.tag, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, key, nonceBuffer);
        decipher.setAuthTag(tagBuffer);
        let plaintext = decipher.update(ciphertextBuffer);
        decipher.final();
        return plaintext.toString("utf-8");
    }
    catch (error) {
        // Could be authentication failure or decryption failure
        if (error instanceof Error) {
            if (error.message.includes("Unsupported state or unable to authenticate data")) {
                return "AUTHENTICATION_FAILED";
            }
        }
        return "DECRYPTION_FAILED";
    }
}
/**
 * Generates a random Master Key (32 bytes for AES-256)
 */
export function generateMasterKey() {
    return crypto.randomBytes(32);
}
/**
 * Generates a random Data Encryption Key (32 bytes for AES-256)
 */
export function generateDEK() {
    return crypto.randomBytes(DEK_LENGTH);
}
/**
 * Wraps a DEK using the master key
 */
export function wrapDEK(dek, masterKey, nonce) {
    return encrypt(dek.toString("hex"), masterKey, nonce);
}
/**
 * Unwraps a wrapped DEK using the master key
 */
export function unwrapDEK(wrappedData, masterKey) {
    const result = decrypt(wrappedData, masterKey);
    // Check if result is an error code string
    const errorCodes = ["INVALID_NONCE_LENGTH", "INVALID_TAG_LENGTH", "INVALID_HEX", "DECRYPTION_FAILED", "AUTHENTICATION_FAILED"];
    if (typeof result === "string" && errorCodes.includes(result)) {
        return result;
    }
    // Result should be a hex string representing the DEK
    if (typeof result === "string") {
        try {
            return Buffer.from(result, "hex");
        }
        catch {
            return "INVALID_HEX";
        }
    }
    // This shouldn't happen, but handle it just in case
    return "DECRYPTION_FAILED";
}
//# sourceMappingURL=encryption.js.map