import {
  createCipheriv,
  publicEncrypt,
  randomBytes,
  constants,
} from 'node:crypto';
import { KeyService } from './key.service';
import type { EncryptResult } from '../types/crypto.types';

/**
 * Performs hybrid encryption using AES-256-GCM for the data and RSA-OAEP
 * with SHA-256 for the AES session key.
 *
 * RSA is intentionally used only for the small AES key. The message itself
 * is encrypted symmetrically, which makes the approach appropriate for
 * large payloads.
 */
export class EncryptService {
  /**
   * Encrypts a plaintext message using the hybrid cryptographic scheme.
   *
   * Steps:
   * 1. Generate a random 256-bit AES key.
   * 2. Generate a random 96-bit AES-GCM IV.
   * 3. Encrypt the message with AES-256-GCM.
   * 4. Obtain the GCM authentication tag.
   * 5. Encrypt the AES key with the RSA public key.
   *
   * @param {string} message - Plaintext UTF-8 message.
   * @returns {EncryptResult} Encrypted AES key, IV, authentication tag and ciphertext.
   * @throws {Error} When the public key is unavailable or encryption fails.
   */
  static encryptMessage(message: string): EncryptResult {
    if (!message) {
      throw new Error('Message cannot be empty.');
    }

    const publicKey = KeyService.getPublicKey();
    const aesKey = randomBytes(32);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv);

    const encryptedMessage = Buffer.concat([
      cipher.update(message, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    const encryptedKey = publicEncrypt(
      {
        key: publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      aesKey,
    );

    return {
      encryptedKey: encryptedKey.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      data: encryptedMessage.toString('base64'),
    };
  }
}
