import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { envConfig } from './config/env';
import { KeyService } from './services/key.service';
import { cryptoRouter } from './routes/crypto.routes';
import { swaggerSpec } from './swagger';
import './routes/swagger.docs';

/**
 * Express application entry point.
 *
 * The application validates both RSA key files before starting the HTTP
 * server. This makes a missing private key visible immediately instead of
 * discovering it only when a decrypt operation is requested.
 */
const app = express();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'hybrid-crypto-express-ts',
  });
});

app.use('/api/crypto', cryptoRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

KeyService.validateKeyFiles();

app.listen(envConfig.port, () => {
  console.log(`API running on http://localhost:${envConfig.port}`);
  console.log(`Swagger UI on http://localhost:${envConfig.port}/api-docs`);
  console.log('RSA public/private key files validated successfully.');
});

export default app;
