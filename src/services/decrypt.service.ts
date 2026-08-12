import {
  createDecipheriv,
  constants,
  privateDecrypt,
} from 'node:crypto';
import { KeyService } from './key.service';
import type { EncryptedPayload } from '../types/crypto.types';

/**
 * Performs the inverse operation of the hybrid encryption service.
 *
 * The RSA private key recovers the AES session key. AES-256-GCM then
 * decrypts and authenticates the actual message.
 */
export class DecryptService {
  /**
   * Decrypts an encrypted payload.
   *
   * @param {EncryptedPayload} payload - Base64-encoded encrypted components.
   * @returns {string} Original plaintext UTF-8 message.
   * @throws {Error} When the private key is unavailable, the payload is invalid,
   * or GCM authentication fails.
   */
  static decryptMessage(payload: EncryptedPayload): string {
    const privateKey = KeyService.getPrivateKey();

    const aesKey = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(payload.encryptedKey, 'base64'),
    );

    const decipher = createDecipheriv(
      'aes-256-gcm',
      aesKey,
      Buffer.from(payload.iv, 'base64'),
    );

    decipher.setAuthTag(
      Buffer.from(payload.authTag, 'base64'),
    );

    const decryptedMessage = Buffer.concat([
      decipher.update(Buffer.from(payload.data, 'base64')),
      decipher.final(),
    ]);

    return decryptedMessage.toString('utf8');
  }
}
