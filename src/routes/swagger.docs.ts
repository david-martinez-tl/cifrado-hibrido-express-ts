/**
 * @openapi
 * /api/crypto/encrypt:
 *   post:
 *     summary: Cifra un mensaje con cifrado híbrido
 *     description: Genera una clave AES-256-GCM aleatoria para cifrar el mensaje y cifra esa clave con RSA-OAEP SHA-256 usando la llave pública.
 *     tags: [Cryptography]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncryptRequest'
 *     responses:
 *       200:
 *         description: Payload cifrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EncryptedPayload'
 *       400:
 *         description: Request inválido.
 *       500:
 *         description: Error criptográfico o llave pública no disponible.
 *
 * /api/crypto/decrypt:
 *   post:
 *     summary: Descifra un payload híbrido
 *     description: Descifra la clave AES con la llave privada RSA y posteriormente descifra y autentica el mensaje con AES-256-GCM.
 *     tags: [Cryptography]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EncryptedPayload'
 *     responses:
 *       200:
 *         description: Mensaje original.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DecryptResponse'
 *       400:
 *         description: Payload inválido, corrupto o incompatible con la llave privada.
 */
export {};
