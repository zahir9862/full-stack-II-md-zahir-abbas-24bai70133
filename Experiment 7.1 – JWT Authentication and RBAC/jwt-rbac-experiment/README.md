# Experiment 2.3.1 — JWT Authentication + Spring Security + RBAC

This implementation follows the uploaded experiment document:
JWT -> Spring Security Filter Chain -> JWT Authentication Filter -> SecurityContext -> RBAC/@PreAuthorize.

## Requirements
- JDK 17+
- Maven 3.9+ (or use the Maven wrapper from your IDE)
- VS Code / IntelliJ IDEA
- Postman

## Run
```bash
mvn clean spring-boot:run
```

Server:
http://localhost:8080

## Test users
Admin:
username: admin
password: admin123

User:
username: user
password: user123

## Postman

### 1. Login as ADMIN
POST http://localhost:8080/auth/login

Body -> raw -> JSON:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Copy the returned token.

### 2. Test ADMIN endpoint
GET http://localhost:8080/api/admin

Header:
Authorization: Bearer <paste-token>

Expected with ADMIN token:
Admin API - Access Allowed

### 3. Login as USER
POST http://localhost:8080/auth/login

```json
{
  "username": "user",
  "password": "user123"
}
```

Use that token for:
GET http://localhost:8080/api/admin

Expected:
403 Forbidden

### 4. Test USER endpoint
GET http://localhost:8080/api/user

USER token -> allowed
ADMIN token -> allowed

### 5. Test without JWT
GET http://localhost:8080/api/admin

Expected:
401 Unauthorized

## Flow
1. POST /auth/login
2. Credentials are authenticated.
3. JwtService generates a signed JWT.
4. Client sends Authorization: Bearer <JWT>.
5. JwtAuthenticationFilter extracts and validates the token.
6. Username and role are placed in SecurityContext.
7. @PreAuthorize checks the role.
8. API returns 200, 401, or 403 as appropriate.
