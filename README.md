# Mini proyecto: cifrado híbrido con Express + TypeScript

## 1. Objetivo

Este proyecto implementa una API REST de demostración para entender y probar **cifrado híbrido** en Node.js con Express y TypeScript.

La idea central es combinar dos algoritmos con responsabilidades diferentes:

- **AES-256-GCM**: cifra el contenido real del mensaje.
- **RSA-OAEP con SHA-256**: cifra la clave AES generada para esa operación.

La estructura está basada en los servicios compartidos para cifrado y descifrado. El servicio original cifra el mensaje con AES-256-GCM, obtiene el `authTag` y después cifra la clave AES con RSA; el resultado se transporta como `encryptedKey`, `iv`, `authTag` y `data`. El servicio de descifrado realiza la operación inversa utilizando la llave privada RSA.

## 2. Flujo general

```text
CLIENTE
   |
   | POST /api/crypto/encrypt
   | { message }
   v
EXPRESS
   |
   +--> Genera AES-256 key aleatoria
   |
   +--> Genera IV aleatorio
   |
   +--> AES-256-GCM cifra el mensaje
   |
   +--> Obtiene authTag
   |
   +--> RSA-OAEP cifra la AES key con public.pem
   |
   v
RESPUESTA
{
  encryptedKey,
  iv,
  authTag,
  data
}
```

Para descifrar:

```text
CLIENTE
   |
   | POST /api/crypto/decrypt
   | { encryptedKey, iv, authTag, data }
   v
EXPRESS
   |
   +--> private.pem descifra encryptedKey
   |
   +--> recupera AES key
   |
   +--> AES-256-GCM valida authTag
   |
   +--> descifra data
   |
   v
MENSAJE ORIGINAL
```

## 3. ¿Qué significa cifrado híbrido?

El cifrado híbrido no utiliza un único algoritmo para todo el mensaje.

Se genera una clave simétrica AES aleatoria para cada operación. Esa clave se utiliza para cifrar el contenido. Después, la clave AES pequeña se cifra con la llave pública RSA del receptor.

El receptor utiliza su llave privada RSA para recuperar la clave AES y finalmente utiliza AES para descifrar el mensaje.

```text
                    CIFRADO HÍBRIDO

Mensaje grande
     |
     v
 AES-256-GCM
     |
     +----> data + authTag

AES key aleatoria
     |
     v
 RSA-OAEP SHA-256 + public.pem
     |
     +----> encryptedKey
```

## 4. ¿Por qué no cifrar todo el mensaje directamente con RSA?

RSA es un algoritmo de criptografía asimétrica pensado principalmente para operaciones con datos pequeños, como proteger una clave simétrica.

AES, en cambio, es un algoritmo simétrico diseñado para cifrar grandes volúmenes de información de manera mucho más eficiente.

Si intentáramos cifrar un documento grande directamente con RSA, tendríamos limitaciones relacionadas con el tamaño máximo del mensaje y un coste computacional mucho mayor.

Con cifrado híbrido:

```text
Mensaje de 10 MB
      |
      v
AES-256-GCM
      |
      +--> cifrado eficiente del contenido

AES key de 32 bytes
      |
      v
RSA-OAEP
      |
      +--> protección de la clave
```

Por eso el patrón recomendado es:

> **RSA protege la clave; AES protege los datos.**

## 5. ¿Por qué AES-256-GCM?

AES es simétrico: utiliza la misma clave para cifrar y descifrar.

GCM, además de confidencialidad, proporciona autenticación del ciphertext mediante un `authTag`.

En este proyecto utilizamos:

- AES-256: clave de 256 bits.
- GCM: modo autenticado.
- IV de 12 bytes generado aleatoriamente.
- `authTag`: permite detectar modificaciones del ciphertext.

Si alguien modifica `data`, `iv` o el `authTag`, la operación de descifrado debe fallar.

## 6. ¿Por qué RSA-OAEP?

OAEP es un esquema de padding diseñado para cifrado RSA y preferible frente al padding RSA PKCS#1 v1.5 para nuevos diseños de cifrado.

El proyecto utiliza explícitamente:

```text
RSA_PKCS1_OAEP_PADDING
OAEP hash: SHA-256
```

La clave AES se cifra con la llave pública y solamente la llave privada correspondiente puede recuperarla.

## 7. Llaves pública y privada

El proyecto espera:

```text
keys/
├── public.pem
└── private.pem
```

Las llaves **no se incluyen** en el repositorio ni en el ZIP.

El `.gitignore` excluye `*.pem` para evitar subir accidentalmente material criptográfico privado.

## 8. Generar las llaves RSA

Requiere OpenSSL.

### 8.1 Generar llave privada RSA de 3072 bits

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out keys/private.pem
```

### 8.2 Obtener la llave pública

```bash
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
```

Verificar:

```bash
openssl rsa -in keys/private.pem -check -noout
```

Mostrar información de la llave pública:

```bash
openssl rsa -pubin -in keys/public.pem -text -noout
```

## 9. Configurar variables de entorno

Copiar:

```bash
cp .env.example .env
```

El `.env` debe contener, por ejemplo:

```env
PORT=3000
PUBLIC_KEY_PATH=./keys/public.pem
PRIVATE_KEY_PATH=./keys/private.pem
```

No colocar el contenido completo de las llaves dentro de `.env` para este ejemplo. Se utilizan rutas de archivos para reducir problemas de escaping, saltos de línea y exposición accidental.

## 10. Validación de las llaves

El proyecto valida la existencia y lectura de **ambas** llaves antes de iniciar Express.

Si falta `public.pem`:

```text
RSA public key not found: ...
```

Si falta `private.pem`:

```text
RSA private key not found: ...
```

Esto hace que un despliegue mal configurado falle rápidamente y no espere hasta una petición HTTP.

### Importante sobre el endpoint de cifrado

Desde el punto de vista criptográfico, el endpoint `/encrypt` necesita la **llave pública**, no la privada.

La **llave privada es necesaria para `/decrypt`**.

Aun así, este mini proyecto valida ambas al arrancar porque el objetivo es garantizar que el servicio completo de cifrado/descifrado esté correctamente configurado. Esto evita confundir una ausencia de `private.pem` con un problema del algoritmo de cifrado.

## 11. Instalar dependencias

```bash
npm install
```

## 12. Ejecutar en desarrollo

```bash
npm run dev
```

## 13. Compilar

```bash
npm run build
```

## 14. Ejecutar compilado

```bash
npm start
```

## 15. Swagger

Abrir:

```text
http://localhost:3000/api-docs
```

Swagger permite probar:

```text
POST /api/crypto/encrypt
POST /api/crypto/decrypt
```

## 16. Ejemplo de cifrado

Request:

```json
{
  "message": "Este es un mensaje confidencial de prueba."
}
```

Response:

```json
{
  "encryptedKey": "...base64...",
  "iv": "...base64...",
  "authTag": "...base64...",
  "data": "...base64..."
}
```

## 17. Ejemplo de descifrado

Enviar exactamente el resultado anterior a:

```text
POST /api/crypto/decrypt
```

```json
{
  "encryptedKey": "...base64...",
  "iv": "...base64...",
  "authTag": "...base64...",
  "data": "...base64..."
}
```

Respuesta:

```json
{
  "message": "Este es un mensaje confidencial de prueba."
}
```

## 18. Seguridad de las llaves

La llave privada es el elemento más sensible del sistema.

Buenas prácticas:

1. No subir `private.pem` a Git.
2. No enviarla por correo ni incluirla en el frontend.
3. Usar permisos restrictivos en el filesystem.
4. En producción, considerar un Secret Manager o KMS/HSM.
5. Rotar las llaves según la política de seguridad de la organización.
6. Separar llaves por ambiente cuando sea necesario.
7. No registrar el contenido de las llaves en logs.
8. Usar HTTPS/TLS aunque el payload de aplicación esté cifrado.

## 19. Arquitectura

```text
src/
├── app.ts
├── config/
│   └── env.ts
├── controllers/
│   └── crypto.controller.ts
├── routes/
│   ├── crypto.routes.ts
│   └── swagger.docs.ts
├── services/
│   ├── key.service.ts
│   ├── encrypt.service.ts
│   └── decrypt.service.ts
├── types/
│   └── crypto.types.ts
└── swagger.ts
```

Responsabilidades:

- `config`: configuración del proceso.
- `types`: contratos TypeScript.
- `key.service`: lectura y validación de llaves.
- `encrypt.service`: cifrado híbrido.
- `decrypt.service`: descifrado híbrido.
- `controller`: entrada/salida HTTP.
- `routes`: endpoints.
- `swagger`: documentación OpenAPI.
- `app.ts`: composición y arranque de Express.

## 20. Relación con los servicios base compartidos

La implementación parte de la misma idea presente en los servicios entregados:

- generación aleatoria de una clave AES de 32 bytes;
- IV de 12 bytes;
- AES-256-GCM;
- `authTag`;
- RSA para cifrar la clave AES;
- Base64 para transportar los componentes por JSON.

La principal mejora del mini proyecto es separar responsabilidades, validar explícitamente la existencia de las llaves y configurar RSA-OAEP con SHA-256 de forma explícita.

## 21. Limitaciones de este mini proyecto

Este proyecto es una demostración y no pretende ser un protocolo criptográfico para ser implementado de forma direta en producción.

Para un escenario empresarial habría que definir adicionalmente:

- versionado del formato del payload;
- identificación de la llave utilizada (`keyId`);
- rotación de llaves;
- gestión de llaves mediante KMS/HSM/Secret Manager;
- límites de tamaño y streaming para archivos grandes;
- control de acceso y autenticación de los endpoints;
- auditoría;
- rate limiting;
- manejo de errores sin revelar información criptográfica sensible;
- estrategia de almacenamiento y transporte del ciphertext.
