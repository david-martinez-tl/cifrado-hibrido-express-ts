import { Router } from 'express';
import { CryptoController } from '../controllers/crypto.controller';

/**
 * Routes exposing the hybrid encryption demonstration endpoints.
 */
export const cryptoRouter = Router();

cryptoRouter.post('/encrypt', CryptoController.encrypt);
cryptoRouter.post('/decrypt', CryptoController.decrypt);
