import 'dotenv/config';

/**
 * Runtime configuration used by the cryptographic services.
 */
export interface EnvConfig {
  /** HTTP port used by Express. */
  port: number;
  /** Filesystem path to the RSA public key. */
  publicKeyPath: string;
  /** Filesystem path to the RSA private key. */
  privateKeyPath: string;
}

/**
 * Reads environment variables and converts them into typed application configuration.
 *
 * @returns {EnvConfig} Validated application configuration.
 * @throws {Error} If a required environment variable is missing or invalid.
 */
export const loadEnvConfig = (): EnvConfig => {
  const port = Number(process.env.PORT ?? 3000);
  const publicKeyPath = process.env.PUBLIC_KEY_PATH;
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;

  if (!publicKeyPath) {
    throw new Error('PUBLIC_KEY_PATH is required.');
  }

  if (!privateKeyPath) {
    throw new Error('PRIVATE_KEY_PATH is required.');
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return {
    port,
    publicKeyPath,
    privateKeyPath,
  };
};

export const envConfig = loadEnvConfig();
