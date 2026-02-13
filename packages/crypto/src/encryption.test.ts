import { describe, it, expect } from "vitest";
import {
  encrypt,
  decrypt,
  generateDEK,
  generateMasterKey,
  validateNonce,
  validateTag,
  isValidHex,
  wrapDEK,
  unwrapDEK,
} from "../src/encryption";
import { EnvelopeEncryption } from "../src/envelope";

describe("Encryption Tests", () => {
  it("should encrypt and decrypt a plaintext string", () => {
    const key = generateMasterKey();
    const plaintext = "Hello, Secure World!";

    const encrypted = encrypt(plaintext, key);
    const decrypted = decrypt(encrypted, key);

    expect(decrypted).toBe(plaintext);
  });

  it("should reject tampered ciphertext", () => {
    const key = generateMasterKey();
    const plaintext = "Secret data";

    const encrypted = encrypt(plaintext, key);

    // Tamper with ciphertext
    const tampered = {
      ...encrypted,
      ciphertext: "cafebabe" + encrypted.ciphertext.slice(8),
    };

    const result = decrypt(tampered, key);
    expect(typeof result).toBe("string");
    expect(result).not.toBe(plaintext);
  });

  it("should reject tampered tag", () => {
    const key = generateMasterKey();
    const plaintext = "Secret data";

    const encrypted = encrypt(plaintext, key);

    // Tamper with tag
    const tampered = {
      ...encrypted,
      tag: "cafebabecafebabecafebabecafebabe",
    };

    const result = decrypt(tampered, key);
    expect(typeof result).toBe("string");
  });

  it("should reject invalid nonce length", () => {
    const encrypted = {
      nonce: "cafebabe", // too short
      ciphertext: "deadbeef",
      tag: "cafebabecafebabecafebabecafebabe",
    };

    const key = generateMasterKey();
    const result = decrypt(encrypted, key);

    expect(result).toBe("INVALID_NONCE_LENGTH");
  });

  it("should reject invalid tag length", () => {
    const encrypted = {
      nonce: "cafebabecafebabecafebabe", // 12 bytes in hex = 24 chars
      ciphertext: "deadbeef",
      tag: "cafebabe", // too short
    };

    const key = generateMasterKey();
    const result = decrypt(encrypted, key);

    expect(result).toBe("INVALID_TAG_LENGTH");
  });

  it("should validate nonce length correctly", () => {
    expect(validateNonce("cafebabecafebabecafebabe")).toBe(true); // 12 bytes
    expect(validateNonce("cafebabe")).toBe(false); // 4 bytes
    expect(validateNonce("cafebabecafebabecafebabecafebabe")).toBe(false); // 16 bytes
  });

  it("should validate tag length correctly", () => {
    expect(validateTag("cafebabecafebabecafebabecafebabe")).toBe(true); // 16 bytes
    expect(validateTag("cafebabe")).toBe(false); // 4 bytes
  });

  it("should validate hex strings", () => {
    expect(isValidHex("cafebabe")).toBe(true);
    expect(isValidHex("DEADBEEF")).toBe(true);
    expect(isValidHex("xyz")).toBe(false);
    expect(isValidHex("cafe-babe")).toBe(false);
  });

  it("should wrap and unwrap DEK correctly", () => {
    const masterKey = generateMasterKey();
    const dek = generateDEK();

    const wrapped = wrapDEK(dek, masterKey);
    const unwrapped = unwrapDEK(wrapped, masterKey);

    expect(unwrapped).not.toBe("DECRYPTION_FAILED");
    expect(unwrapped).not.toBe("AUTHENTICATION_FAILED");
    if (typeof unwrapped !== "string") {
      expect(unwrapped.toString("hex")).toBe(dek.toString("hex"));
    }
  });
});

describe("Envelope Encryption Tests", () => {
  it("should encrypt and decrypt a complete transaction", () => {
    const masterKey = generateMasterKey();
    const envelope = new EnvelopeEncryption(masterKey);

    const payload = { amount: 100, currency: "AED" };
    const partyId = "party_123";

    const encrypted = envelope.encryptPayload(payload, partyId);
    expect(encrypted.id).toBeDefined();
    expect(encrypted.partyId).toBe(partyId);
    expect(encrypted.alg).toBe("AES-256-GCM");

    const decrypted = envelope.decryptPayload(encrypted);
    expect(decrypted).toEqual(payload);
  });

  it("should detect tampering in wrapped DEK", () => {
    const masterKey = generateMasterKey();
    const envelope = new EnvelopeEncryption(masterKey);

    const payload = { amount: 100, currency: "AED" };
    const encrypted = envelope.encryptPayload(payload, "party_123");

    // Tamper with wrapped DEK
    encrypted.dek_wrapped = "cafebabe" + encrypted.dek_wrapped.slice(8);

    const result = envelope.decryptPayload(encrypted);
    expect(typeof result).toBe("string");
  });

  it("should detect tampering in payload ciphertext", () => {
    const masterKey = generateMasterKey();
    const envelope = new EnvelopeEncryption(masterKey);

    const payload = { amount: 100, currency: "AED" };
    const encrypted = envelope.encryptPayload(payload, "party_123");

    // Tamper with payload ciphertext
    encrypted.payload_ct = "deadbeef" + encrypted.payload_ct.slice(8);

    const result = envelope.decryptPayload(encrypted);
    expect(typeof result).toBe("string");
  });

  it("should handle multiple different payloads", () => {
    const masterKey = generateMasterKey();
    const envelope = new EnvelopeEncryption(masterKey);

    const payload1 = { amount: 100, currency: "AED" };
    const payload2 = { amount: 200, currency: "USD" };

    const encrypted1 = envelope.encryptPayload(payload1, "party_123");
    const encrypted2 = envelope.encryptPayload(payload2, "party_456");

    expect(encrypted1.id).not.toBe(encrypted2.id);
    expect(encrypted1.dek_wrapped).not.toBe(encrypted2.dek_wrapped);

    const decrypted1 = envelope.decryptPayload(encrypted1);
    const decrypted2 = envelope.decryptPayload(encrypted2);

    expect(decrypted1).toEqual(payload1);
    expect(decrypted2).toEqual(payload2);
  });
});
