export type EncryptRequest = {
  partyId: string;
  payload: object;
};

export type EncryptResponse = {
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

export type DecryptResponse = {
  payload: object;
};

export type ErrorResponse = {
  error: string;
  message: string;
};
