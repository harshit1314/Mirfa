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
  mk_version: number;
};

export type EncryptedPayload = {
  nonce: string;
  ciphertext: string;
  tag: string;
};

export type DecryptError =
  | "INVALID_NONCE_LENGTH"
  | "INVALID_TAG_LENGTH"
  | "INVALID_HEX"
  | "DECRYPTION_FAILED"
  | "AUTHENTICATION_FAILED";
