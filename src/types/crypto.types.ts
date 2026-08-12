/**
 * DTO accepted by the decrypt endpoint.
 *
 * All binary cryptographic values are transported as Base64 strings because
 * JSON does not have a native binary type.
 */
export interface EncryptedPayload {
  /** AES session key encrypted with the RSA public key. */
  encryptedKey: string;
  /** AES-GCM initialization vector. */
  iv: string;
  /** AES-GCM authentication tag. */
  authTag: string;
  /** Ciphertext produced by AES-256-GCM. */
  data: string;
}

/**
 * Response produced by the encryption operation.
 */
export type EncryptResult = EncryptedPayload;

/**
 * Request body for POST /api/crypto/encrypt.
 */
export interface EncryptRequest {
  /** Plaintext message to encrypt. */
  message: string;
}

/**
 * Response produced by POST /api/crypto/decrypt.
 */
export interface DecryptResult {
  /** Original plaintext message. */
  message: string;
}
