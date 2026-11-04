# Experiment 2.3.2 — AES Encryption + Secure Credential Storage + Access/Refresh Tokens

This project implements the main concepts from the supplied experiment PDF:

- AES-256-GCM encryption/decryption
- Random 12-byte IV for every encryption
- Environment-based AES key
- Secure credential storage using H2/JPA
- OAuth access/refresh credential encryption at rest
- Short-lived JWT access token
- Long-lived refresh token
- SHA-256 hash storage for refresh tokens
- SecureRandom refresh-token generation
- Refresh-token rotation
- Refresh-token revocation
- Refresh-token reuse detection at family level
- Protected API using Bearer access token
- Interactive demonstration UI

## Requirements

- Java 17
- Maven 3.8+
- VS Code (recommended)

## 1. Generate secrets

Open PowerShell.

Generate a 32-byte AES key:

```powershell
$aes = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Generate a 32-byte JWT signing secret:

```powershell
$jwt = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

For stronger cryptographic generation on Windows, Java's SecureRandom can also be used. The commands above are only convenient development setup values; production secret generation should use a dedicated secret-management process.

Set them for the current PowerShell session:

```powershell
$env:APP_AES_KEY = $aes
$env:APP_JWT_SECRET = $jwt
```

Check that they exist:

```powershell
echo $env:APP_AES_KEY
echo $env:APP_JWT_SECRET
```

Do not commit these values to Git.

## 2. Run the application

From the project root:

```powershell
mvn spring-boot:run
```

Open:

```text
http://localhost:8080/
```

## Demo accounts

```text
admin / admin123
user  / user123
```

## 3. Test the flow

### Login

POST:

```text
/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 900
}
```

The access token is intended for API calls. The refresh token is used only with the refresh endpoint.

### Protected API

GET:

```text
/api/protected
```

Header:

```text
Authorization: Bearer <accessToken>
```

### Refresh and rotate

POST:

```text
/auth/refresh
```

Body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

The old refresh token is revoked and a new refresh token is issued.

### Revoke

POST:

```text
/auth/revoke
```

Body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

### Public API

GET:

```text
/api/public
```

No token required.

## 4. AES credential storage

POST:

```text
/api/credentials
```

Body:

```json
{
  "provider": "Demo OAuth",
  "accessToken": "demo-access-secret",
  "refreshToken": "demo-refresh-secret"
}
```

The recoverable credential values are encrypted with AES/GCM/NoPadding and stored as ciphertext. The IV is prepended to the ciphertext and Base64 encoded.

The refresh-token table stores a SHA-256 hash instead of the raw refresh token.

## H2 console

Open:

```text
http://localhost:8080/h2-console
```

JDBC URL:

```text
jdbc:h2:file:./data/aes_tokens
```

User:

```text
sa
```

Password: leave blank.

The `oauth_credentials` table demonstrates encrypted values. The `refresh_tokens` table demonstrates hashed refresh-token storage.

## Security notes

- Passwords are hashed with BCrypt.
- AES uses AES/GCM/NoPadding with a unique 12-byte IV.
- AES-256 requires a 32-byte key.
- JWT access tokens expire after 15 minutes by default.
- Refresh tokens last 7 days by default.
- Refresh tokens are generated with SecureRandom.
- Raw refresh tokens are not stored in the database.
- Encryption keys are supplied through environment variables.
- HTTPS/TLS should be used in real deployments.

This is an educational implementation for the supplied experiment, not a production OAuth server.
