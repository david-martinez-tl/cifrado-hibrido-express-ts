import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { envConfig } from '../config/env';

/**
 * Reads and validates RSA key files used by the application.
 *
 * The application intentionally fails fast when the key files do not exist.
 * This prevents the API from starting in a state where cryptographic
 * operations would inevitably fail later at request time.
 */
export class KeyService {
  /**
   * Resolves a configured path against the current working directory when it
   * is relative, while preserving absolute paths.
   *
   * @param configuredPath - Path supplied through the environment.
   * @returns {string} Absolute filesystem path.
   */
  private static resolvePath(configuredPath: string): string {
    return path.resolve(process.cwd(), configuredPath);
  }

  /**
   * Verifies that both RSA key files exist and are readable.
   *
   * @throws {Error} When the public or private key cannot be found/read.
   */
  static validateKeyFiles(): void {
    const publicPath = this.resolvePath(envConfig.publicKeyPath);
    const privatePath = this.resolvePath(envConfig.privateKeyPath);

    if (!existsSync(publicPath)) {
      throw new Error(`RSA public key not found: ${publicPath}`);
    }

    if (!existsSync(privatePath)) {
      throw new Error(`RSA private key not found: ${privatePath}`);
    }

    try {
      readFileSync(publicPath, 'utf8');
      readFileSync(privatePath, 'utf8');
    } catch (error) {
      throw new Error(
        `RSA key files exist but cannot be read: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  /**
   * Loads the RSA public key from disk.
   *
   * @returns {string} PEM-encoded public key.
   */
  static getPublicKey(): string {
    const keyPath = this.resolvePath(envConfig.publicKeyPath);
    return readFileSync(keyPath, 'utf8');
  }

  /**
   * Loads the RSA private key from disk.
   *
   * @returns {string} PEM-encoded private key.
   */
  static getPrivateKey(): string {
    const keyPath = this.resolvePath(envConfig.privateKeyPath);
    return readFileSync(keyPath, 'utf8');
  }
}
