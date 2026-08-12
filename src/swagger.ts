import swaggerJSDoc from 'swagger-jsdoc';

/**
 * OpenAPI specification for the hybrid cryptography demo API.
 */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Hybrid Cryptography API',
      version: '1.0.0',
      description:
        'Demo API de cifrado híbrido usando AES-256-GCM para los datos y RSA-OAEP SHA-256 para proteger la clave AES.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      {
        name: 'Cryptography',
        description: 'Operaciones de cifrado y descifrado híbrido.',
      },
    ],
    components: {
      schemas: {
        EncryptRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              example: 'Mensaje confidencial de ejemplo.',
            },
          },
        },
        EncryptedPayload: {
          type: 'object',
          required: ['encryptedKey', 'iv', 'authTag', 'data'],
          properties: {
            encryptedKey: {
              type: 'string',
              format: 'byte',
              description: 'Clave AES cifrada con RSA-OAEP y codificada en Base64.',
            },
            iv: {
              type: 'string',
              format: 'byte',
              description: 'IV de AES-GCM codificado en Base64.',
            },
            authTag: {
              type: 'string',
              format: 'byte',
              description: 'Authentication tag de AES-GCM en Base64.',
            },
            data: {
              type: 'string',
              format: 'byte',
              description: 'Ciphertext producido por AES-256-GCM en Base64.',
            },
          },
        },
        DecryptResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Mensaje confidencial de ejemplo.',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
});
