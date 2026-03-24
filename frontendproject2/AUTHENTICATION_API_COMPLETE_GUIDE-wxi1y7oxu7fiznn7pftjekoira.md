# 🔐 Authentication API - Complete Documentation

## 📌 Overview

This document provides complete API specifications for implementing a full authentication system. It includes all endpoints, request/response formats, token management logic, and error handling.

**Use Case:** Frontend development practical task for interns

---

## 🌐 Base Configuration

**Demo API Base URL:**
```
https://auth-demo-api.example.com/api/v1
```

**Alternative Mock API:**
```
https://mockapi.io/auth-demo/v1
```

**Request Headers (All Requests):**
```
Content-Type: application/json
```

**Request Headers (Protected Routes):**
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Token Expiration:**
- Access Token: 15 minutes (900 seconds)
- Refresh Token: 7 days (604800 seconds)
- Reset Token: 1 hour (3600 seconds)
- Temp 2FA Token: 10 minutes (600 seconds)

---

## 📑 Table of Contents

1. [User Registration](#1-user-registration)
2. [User Login](#2-user-login)
3. [Refresh Access Token](#3-refresh-access-token)
4. [Get Current User Profile](#4-get-current-user-profile)
5. [Update User Profile](#5-update-user-profile)
6. [Logout User](#6-logout-user)
7. [Forgot Password](#7-forgot-password)
8. [Reset Password](#8-reset-password)
9. [Change Password](#9-change-password)
10. [Enable 2FA](#10-enable-2fa)
11. [Verify 2FA Setup](#11-verify-2fa-setup)
12. [Verify 2FA Login](#12-verify-2fa-login)
13. [Disable 2FA](#13-disable-2fa)
14. [Error Response Format](#error-response-format)
15. [HTTP Status Codes](#http-status-codes)

---

## 1. User Registration

### Endpoint
```
POST /auth/register
```

### Description
Create a new user account with email and password.

### Authentication Required
No

### Request Body Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| email | string | Yes | User's email address | Valid email format, unique |
| password | string | Yes | User's password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |
| firstName | string | Yes | User's first name | 2-50 characters |
| lastName | string | Yes | User's last name | 2-50 characters |

### Request Body Example
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false,
      "twoFactorEnabled": false,
      "createdAt": "2024-02-02T10:30:00.000Z",
      "updatedAt": "2024-02-02T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDY4NjU4MDAsImV4cCI6MTcwNjg2NjcwMH0.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA2ODY1ODAwLCJleHAiOjE3MDc0NzA2MDB9.signature",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

### Response Fields Description

**User Object:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique user identifier |
| email | string | User's email address |
| firstName | string | User's first name |
| lastName | string | User's last name |
| emailVerified | boolean | Email verification status |
| twoFactorEnabled | boolean | 2FA enabled status |
| createdAt | string (ISO 8601) | Account creation timestamp |
| updatedAt | string (ISO 8601) | Last update timestamp |

**Tokens Object:**
| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT token for API authentication (15 min) |
| refreshToken | string | Token to get new access token (7 days) |
| expiresIn | number | Access token expiry in seconds (900) |
| tokenType | string | Token type (Always "Bearer") |

### Error Responses

**Status Code:** `400 Bad Request`

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is already registered"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

**Weak Password:**
```json
{
  "success": false,
  "message": "Password does not meet requirements",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long with uppercase, lowercase, number and special character"
    }
  ]
}
```

---

## 2. User Login

### Endpoint
```
POST /auth/login
```

### Description
Authenticate user with email and password. Returns access and refresh tokens if 2FA is disabled, or temp token if 2FA is enabled.

### Authentication Required
No

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User's registered email |
| password | string | Yes | User's password |

### Request Body Example
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### Success Response (Without 2FA)

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "twoFactorEnabled": false,
      "createdAt": "2024-02-02T10:30:00.000Z",
      "updatedAt": "2024-02-02T14:30:00.000Z",
      "lastLogin": "2024-02-02T14:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDY4Nzk0MDAsImV4cCI6MTcwNjg4MDMwMH0.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA2ODc5NDAwLCJleHAiOjE3MDc0ODQyMDB9.signature",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

### Success Response (With 2FA Enabled)

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "2FA verification required",
  "data": {
    "requiresTwoFactor": true,
    "tempToken": "temp_2fa_abc123xyz456def789",
    "userId": "usr_1a2b3c4d5e6f7g8h",
    "expiresIn": 600
  }
}
```

**Response Fields (2FA):**
| Field | Type | Description |
|-------|------|-------------|
| requiresTwoFactor | boolean | Indicates 2FA is required (true) |
| tempToken | string | Temporary token for 2FA verification (10 min) |
| userId | string | User ID for reference |
| expiresIn | number | Temp token expiry in seconds (600) |

### Error Responses

**Status Code:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status Code:** `429 Too Many Requests`

```json
{
  "success": false,
  "message": "Too many login attempts. Please try again later.",
  "retryAfter": 900
}
```

---

## 3. Refresh Access Token

### Endpoint
```
POST /auth/refresh
```

### Description
Get a new access token using the refresh token when the access token expires.

### Authentication Required
No (uses refresh token in body)

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| refreshToken | string | Yes | Valid refresh token from login/register |

### Request Body Example
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA2ODc5NDAwLCJleHAiOjE3MDc0ODQyMDB9.signature"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDY4ODAwMDAsImV4cCI6MTcwNjg4MDkwMH0.signature",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

### Response Fields Description

| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | New JWT access token (15 min validity) |
| expiresIn | number | Token expiry in seconds (900) |
| tokenType | string | Token type (Bearer) |

### Error Responses

**Status Code:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**Status Code:** `401 Unauthorized` (Token Revoked)

```json
{
  "success": false,
  "message": "Refresh token has been revoked"
}
```

---

## 4. Get Current User Profile

### Endpoint
```
GET /auth/me
```

### Description
Retrieve the currently authenticated user's profile information.

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body
None (GET request)

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "twoFactorEnabled": false,
      "createdAt": "2024-02-02T10:30:00.000Z",
      "updatedAt": "2024-02-02T14:30:00.000Z",
      "lastLogin": "2024-02-02T14:30:00.000Z"
    }
  }
}
```

### Error Responses

**Status Code:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Authentication required",
  "code": "TOKEN_MISSING"
}
```

**Status Code:** `401 Unauthorized` (Expired Token)

```json
{
  "success": false,
  "message": "Access token has expired",
  "code": "TOKEN_EXPIRED"
}
```

**Status Code:** `401 Unauthorized` (Invalid Token)

```json
{
  "success": false,
  "message": "Invalid access token",
  "code": "TOKEN_INVALID"
}
```

---

## 5. Update User Profile

### Endpoint
```
PUT /auth/profile
```

### Description
Update the current user's profile information.

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| firstName | string | No | User's first name | 2-50 characters |
| lastName | string | No | User's last name | 2-50 characters |

### Request Body Example
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "Jonathan",
      "lastName": "Doe",
      "emailVerified": true,
      "twoFactorEnabled": false,
      "createdAt": "2024-02-02T10:30:00.000Z",
      "updatedAt": "2024-02-02T15:45:00.000Z",
      "lastLogin": "2024-02-02T14:30:00.000Z"
    }
  }
}
```

### Error Responses

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "firstName",
      "message": "First name must be at least 2 characters"
    }
  ]
}
```

---

## 6. Logout User

### Endpoint
```
POST /auth/logout
```

### Description
Logout user and invalidate the refresh token.

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| refreshToken | string | Yes | Current refresh token to invalidate |

### Request Body Example
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA2ODc5NDAwLCJleHAiOjE3MDc0ODQyMDB9.signature"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Error Responses

**Status Code:** `401 Unauthorized`

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## 7. Forgot Password

### Endpoint
```
POST /auth/forgot-password
```

### Description
Request a password reset link. System sends reset token to user's email.

### Authentication Required
No

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Registered email address |

### Request Body Example
```json
{
  "email": "john.doe@example.com"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent",
  "data": {
    "resetTokenExpiresIn": 3600
  }
}
```

### Response Fields Description

| Field | Type | Description |
|-------|------|-------------|
| resetTokenExpiresIn | number | Reset token expiry time in seconds (3600 = 1 hour) |

### Important Notes
- Always returns success (200) even if email doesn't exist (security best practice)
- Reset token is sent via email to the user
- Email contains reset link format: `https://yourapp.com/reset-password?token={resetToken}`

### Email Content Format
```
Subject: Reset Your Password

Hi John,

You requested to reset your password. Click the link below:

https://yourapp.com/reset-password?token=rst_abc123xyz456def789

This link expires in 1 hour.

If you didn't request this, please ignore this email.
```

### Error Responses
No error responses - always returns success for security.

---

## 8. Reset Password

### Endpoint
```
POST /auth/reset-password
```

### Description
Reset user password using the token received via email.

### Authentication Required
No (uses reset token)

### Request Body Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| token | string | Yes | Reset token from email | Valid, non-expired token |
| newPassword | string | Yes | New password | Min 8 chars, 1 upper, 1 lower, 1 number, 1 special |
| confirmPassword | string | Yes | Password confirmation | Must match newPassword |

### Request Body Example
```json
{
  "token": "rst_abc123xyz456def789",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

### Error Responses

**Status Code:** `400 Bad Request` (Invalid Token)

```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**Status Code:** `400 Bad Request` (Password Mismatch)

```json
{
  "success": false,
  "message": "Passwords do not match",
  "errors": [
    {
      "field": "confirmPassword",
      "message": "Password confirmation does not match"
    }
  ]
}
```

**Status Code:** `400 Bad Request` (Weak Password)

```json
{
  "success": false,
  "message": "Password does not meet security requirements",
  "errors": [
    {
      "field": "newPassword",
      "message": "Password must contain at least one special character"
    }
  ]
}
```

---

## 9. Change Password

### Endpoint
```
POST /auth/change-password
```

### Description
Change password for authenticated user (requires current password).

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| currentPassword | string | Yes | User's current password | Must be correct |
| newPassword | string | Yes | New password | Min 8 chars, 1 upper, 1 lower, 1 number, 1 special |
| confirmPassword | string | Yes | Password confirmation | Must match newPassword |

### Request Body Example
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses

**Status Code:** `400 Bad Request` (Wrong Current Password)

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Status Code:** `400 Bad Request` (Password Mismatch)

```json
{
  "success": false,
  "message": "New passwords do not match"
}
```

---

## 10. Enable 2FA

### Endpoint
```
POST /auth/2fa/enable
```

### Description
Generate QR code and secret key for Two-Factor Authentication setup.

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body
None

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "2FA setup initiated. Scan QR code with authenticator app",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAAXNSR...",
    "secret": "JBSWY3DPEHPK3PXP",
    "issuer": "YourApp",
    "accountName": "john.doe@example.com",
    "backupCodes": [
      "ABCD-1234-EFGH-5678",
      "IJKL-9012-MNOP-3456",
      "QRST-7890-UVWX-1234",
      "YZAB-5678-CDEF-9012",
      "GHIJ-3456-KLMN-7890"
    ]
  }
}
```

### Response Fields Description

| Field | Type | Description |
|-------|------|-------------|
| qrCode | string | Base64 encoded QR code image for scanning |
| secret | string | Secret key (manual entry alternative) |
| issuer | string | Application name shown in authenticator |
| accountName | string | User's email shown in authenticator |
| backupCodes | array | 5 backup codes for emergency access |

### Backup Codes Format
- Each code is 16 characters with dashes (XXXX-XXXX-XXXX-XXXX)
- Can be used once as alternative to 2FA code
- User should save these securely

### Compatible Authenticator Apps
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator

### Error Responses

**Status Code:** `400 Bad Request` (2FA Already Enabled)

```json
{
  "success": false,
  "message": "Two-factor authentication is already enabled"
}
```

---

## 11. Verify 2FA Setup

### Endpoint
```
POST /auth/2fa/verify-setup
```

### Description
Verify 2FA setup by entering the 6-digit code from authenticator app. This completes the 2FA activation.

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| code | string | Yes | 6-digit code from authenticator app | 6 numeric digits |

### Request Body Example
```json
{
  "code": "123456"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "2FA enabled successfully",
  "data": {
    "twoFactorEnabled": true,
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "twoFactorEnabled": true
    }
  }
}
```

### Error Responses

**Status Code:** `400 Bad Request` (Invalid Code)

```json
{
  "success": false,
  "message": "Invalid verification code. Please try again."
}
```

**Status Code:** `400 Bad Request` (Code Format)

```json
{
  "success": false,
  "message": "Code must be 6 digits"
}
```

**Status Code:** `410 Gone` (Setup Expired)

```json
{
  "success": false,
  "message": "2FA setup session expired. Please start setup again."
}
```

---

## 12. Verify 2FA Login

### Endpoint
```
POST /auth/2fa/verify-login
```

### Description
Complete login by verifying the 2FA code after initial login attempt.

### Authentication Required
No (uses temp token from login)

### Request Body Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| tempToken | string | Yes | Temporary token from login response | Valid temp token |
| code | string | Conditional | 6-digit code from authenticator | 6 digits (if not using backup) |
| backupCode | string | Conditional | Backup code | Format: XXXX-XXXX-XXXX-XXXX |

**Note:** Provide either `code` OR `backupCode`, not both.

### Request Body Example (With Authenticator Code)
```json
{
  "tempToken": "temp_2fa_abc123xyz456def789",
  "code": "123456"
}
```

### Request Body Example (With Backup Code)
```json
{
  "tempToken": "temp_2fa_abc123xyz456def789",
  "backupCode": "ABCD-1234-EFGH-5678"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "2FA verification successful",
  "data": {
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "twoFactorEnabled": true,
      "lastLogin": "2024-02-02T15:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDY4ODMwMDAsImV4cCI6MTcwNjg4MzkwMH0.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZTZmN2c4aCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA2ODgzMDAwLCJleHAiOjE3MDc0ODc4MDB9.signature",
      "expiresIn": 900,
      "tokenType": "Bearer"
    },
    "backupCodeUsed": false
  }
}
```

### Response Fields Description

| Field | Type | Description |
|-------|------|-------------|
| user | object | Complete user profile |
| tokens | object | Access and refresh tokens |
| backupCodeUsed | boolean | True if backup code was used (that code is now invalid) |

### Error Responses

**Status Code:** `400 Bad Request` (Invalid Code)

```json
{
  "success": false,
  "message": "Invalid 2FA code"
}
```

**Status Code:** `400 Bad Request` (Invalid Backup Code)

```json
{
  "success": false,
  "message": "Invalid or already used backup code"
}
```

**Status Code:** `401 Unauthorized` (Expired Temp Token)

```json
{
  "success": false,
  "message": "Temporary token expired. Please login again."
}
```

**Status Code:** `429 Too Many Requests` (Too Many Attempts)

```json
{
  "success": false,
  "message": "Too many verification attempts. Please try again in 5 minutes.",
  "retryAfter": 300
}
```

---

## 13. Disable 2FA

### Endpoint
```
POST /auth/2fa/disable
```

### Description
Disable two-factor authentication for the account.

### Authentication Required
Yes (Access Token)

### Request Headers
```
Authorization: Bearer {accessToken}
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| password | string | Yes | User's current password |
| code | string | Yes | Current 6-digit 2FA code |

### Request Body Example
```json
{
  "password": "SecurePass123!",
  "code": "123456"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "2FA disabled successfully",
  "data": {
    "twoFactorEnabled": false,
    "user": {
      "id": "usr_1a2b3c4d5e6f7g8h",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "twoFactorEnabled": false
    }
  }
}
```

### Error Responses

**Status Code:** `400 Bad Request` (Wrong Password)

```json
{
  "success": false,
  "message": "Invalid password"
}
```

**Status Code:** `400 Bad Request` (Invalid Code)

```json
{
  "success": false,
  "message": "Invalid 2FA code"
}
```

**Status Code:** `400 Bad Request` (2FA Not Enabled)

```json
{
  "success": false,
  "message": "Two-factor authentication is not enabled"
}
```

---

## Error Response Format

All error responses follow a consistent structure:

### Standard Error Format
```json
{
  "success": false,
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific field error"
    }
  ]
}
```

### Error Response Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Always false for errors |
| message | string | Yes | Main error message |
| code | string | No | Error code for programmatic handling |
| errors | array | No | Detailed field-level errors (validation) |

### Common Error Codes

| Code | Description | Typical Status |
|------|-------------|----------------|
| VALIDATION_ERROR | Request validation failed | 400 |
| INVALID_CREDENTIALS | Wrong email/password | 401 |
| TOKEN_EXPIRED | Access token expired | 401 |
| TOKEN_INVALID | Malformed/invalid token | 401 |
| TOKEN_MISSING | No authorization header | 401 |
| EMAIL_EXISTS | Email already registered | 409 |
| USER_NOT_FOUND | User doesn't exist | 404 |
| RATE_LIMIT_EXCEEDED | Too many requests | 429 |
| 2FA_REQUIRED | Need 2FA verification | 400 |
| INVALID_2FA_CODE | Wrong 2FA code | 400 |
| PASSWORD_TOO_WEAK | Password requirements not met | 400 |
| RESET_TOKEN_INVALID | Invalid reset token | 400 |
| RESET_TOKEN_EXPIRED | Reset token expired | 400 |
| REFRESH_TOKEN_INVALID | Invalid refresh token | 401 |
| REFRESH_TOKEN_EXPIRED | Refresh token expired | 401 |
| TEMP_TOKEN_EXPIRED | 2FA temp token expired | 401 |
| BACKUP_CODE_INVALID | Invalid backup code | 400 |
| SERVER_ERROR | Internal server error | 500 |
| SERVICE_UNAVAILABLE | Service down | 503 |

---

## HTTP Status Codes

### Success Codes

| Code | Name | When Used |
|------|------|-----------|
| 200 | OK | Successful GET, POST, PUT requests |
| 201 | Created | Resource created (registration) |

### Client Error Codes

| Code | Name | When Used |
|------|------|-----------|
| 400 | Bad Request | Validation failed, malformed request |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Valid auth but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 410 | Gone | Resource expired/deleted |
| 422 | Unprocessable Entity | Semantic validation errors |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Error Codes

| Code | Name | When Used |
|------|------|-----------|
| 500 | Internal Server Error | Server-side error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily down |
| 504 | Gateway Timeout | Request timeout |

---

## Token Management Logic

### Access Token
**Purpose:** Authenticate API requests  
**Validity:** 15 minutes (900 seconds)  
**Storage:** Memory or secure session storage  
**Usage:** Include in Authorization header  
**Format:** `Bearer {accessToken}`  
**Refresh:** Use refresh token when expired

### Refresh Token
**Purpose:** Get new access tokens  
**Validity:** 7 days (604800 seconds)  
**Storage:** HttpOnly cookie (recommended) or secure storage  
**Usage:** Send to `/auth/refresh` endpoint  
**Security:** One-time use, rotated on refresh  
**Revocation:** Logout invalidates token

### Token Flow Diagram
```
1. Login → Get Access Token (15 min) + Refresh Token (7 days)
2. Use Access Token for API calls
3. Access Token expires (15 min) → Use Refresh Token
4. Get New Access Token → Continue using API
5. Refresh Token expires (7 days) → User must login again
```

### Token Refresh Strategy
```
When API returns 401 (Token Expired):
1. Check if refresh token exists
2. Call /auth/refresh with refresh token
3. Get new access token
4. Retry original API request with new token
5. If refresh fails → Redirect to login
```

---

## Authentication Flow Diagrams

### 1. Registration Flow
```
User → Register Request
     → API validates data
     → Create user account
     → Generate access + refresh tokens
     → Return user data + tokens
     → Store tokens in frontend
```

### 2. Login Flow (Without 2FA)
```
User → Login Request
     → API validates credentials
     → Generate access + refresh tokens
     → Return user data + tokens
     → Store tokens in frontend
```

### 3. Login Flow (With 2FA)
```
User → Login Request
     → API validates credentials
     → Check if 2FA enabled
     → Return temp token + requiresTwoFactor flag
     → User enters 2FA code
     → Verify 2FA Request
     → Generate access + refresh tokens
     → Return user data + tokens
```

### 4. Token Refresh Flow
```
Access Token Expires → API returns 401
     → Frontend catches 401
     → Call /auth/refresh with refresh token
     → Get new access token
     → Retry original request
     → Continue normal flow
```

### 5. Forgot Password Flow
```
User → Forgot Password Request
     → API generates reset token
     → Send email with reset link
     → User clicks link
     → User enters new password
     → Reset Password Request
     → Validate token + update password
     → Success → Redirect to login
```

### 6. 2FA Setup Flow
```
User → Enable 2FA Request
     → API generates secret + QR code
     → Display QR code to user
     → User scans with authenticator app
     → User enters 6-digit code
     → Verify Setup Request
     → API validates code
     → Activate 2FA for account
     → Success
```

---

## API Request Examples Summary

### Quick Reference Table

| Endpoint | Method | Auth Required | Token Type |
|----------|--------|---------------|------------|
| /auth/register | POST | No | - |
| /auth/login | POST | No | - |
| /auth/refresh | POST | No | Refresh Token in body |
| /auth/me | GET | Yes | Access Token |
| /auth/profile | PUT | Yes | Access Token |
| /auth/logout | POST | Yes | Access Token |
| /auth/forgot-password | POST | No | - |
| /auth/reset-password | POST | No | Reset Token in body |
| /auth/change-password | POST | Yes | Access Token |
| /auth/2fa/enable | POST | Yes | Access Token |
| /auth/2fa/verify-setup | POST | Yes | Access Token |
| /auth/2fa/verify-login | POST | No | Temp Token in body |
| /auth/2fa/disable | POST | Yes | Access Token |

---

## Testing Data

### Sample Test Users

**User 1 - Without 2FA:**
```
Email: test1@example.com
Password: Test123!
Status: Email verified, 2FA disabled
```

**User 2 - With 2FA:**
```
Email: test2@example.com
Password: Test456!
Status: Email verified, 2FA enabled
2FA Secret: JBSWY3DPEHPK3PXP
```

**User 3 - Admin:**
```
Email: admin@example.com
Password: Admin789!
Status: Email verified, 2FA enabled
```

### Sample Backup Codes
```
ABCD-1234-EFGH-5678
IJKL-9012-MNOP-3456
QRST-7890-UVWX-1234
YZAB-5678-CDEF-9012
GHIJ-3456-KLMN-7890
```

### Sample Tokens (For Reference)
```
Access Token Structure:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcwNjg2NTgwMCwiZXhwIjoxNzA2ODY2NzAwfQ.
signature_here

Refresh Token Structure:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJ1c3JfMWEyYjNjNGQ1ZSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA2ODY1ODAwLCJleHAiOjE3MDc0NzA2MDB9.
signature_here

Reset Token Format:
rst_abc123xyz456def789ghi012

Temp 2FA Token Format:
temp_2fa_abc123xyz456def789
```

---

## Password Requirements

**Minimum Requirements:**
- At least 8 characters long
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Valid Password Examples:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Test123!@#`
- `Strong#Pass1`

**Invalid Password Examples:**
- `password` (no uppercase, no number, no special char)
- `PASSWORD123` (no lowercase, no special char)
- `Pass123` (too short, no special char)
- `Pass!` (too short, no number)

---

## Rate Limiting

### Rate Limit Rules

| Endpoint | Limit | Window | Penalty |
|----------|-------|--------|---------|
| /auth/register | 5 requests | 1 hour | 1 hour block |
| /auth/login | 5 attempts | 15 minutes | 15 min block |
| /auth/refresh | 10 requests | 1 minute | 1 min block |
| /auth/forgot-password | 3 requests | 1 hour | 1 hour block |
| /auth/2fa/verify-login | 5 attempts | 5 minutes | 5 min block |
| All other endpoints | 60 requests | 1 minute | 1 min block |

### Rate Limit Response
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

### Rate Limit Headers
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706869800
Retry-After: 900
```

---

## Security Best Practices

### Token Storage
✅ **DO:**
- Store access tokens in memory
- Store refresh tokens in httpOnly cookies
- Use secure session storage for demos
- Clear tokens on logout

❌ **DON'T:**
- Store tokens in localStorage
- Store tokens in regular cookies
- Log tokens to console in production
- Share tokens between tabs/windows

### Password Security
✅ **DO:**
- Enforce strong password requirements
- Hash passwords with bcrypt (10+ rounds)
- Implement rate limiting on auth endpoints
- Use HTTPS in production

❌ **DON'T:**
- Store plain text passwords
- Allow weak passwords
- Skip rate limiting
- Use HTTP in production

### API Security
✅ **DO:**
- Validate all input
- Implement CSRF protection
- Use short-lived access tokens
- Rotate refresh tokens
- Log security events

❌ **DON'T:**
- Trust client-side validation only
- Skip authorization checks
- Reuse refresh tokens
- Expose sensitive data in errors

---

## Frontend Implementation Checklist

### Initial Setup
- [ ] Configure base URL
- [ ] Set up axios/fetch instance
- [ ] Create auth state management
- [ ] Implement token storage

### Registration
- [ ] Create registration form
- [ ] Validate email format
- [ ] Validate password strength
- [ ] Handle validation errors
- [ ] Store tokens on success
- [ ] Redirect to dashboard

### Login
- [ ] Create login form
- [ ] Handle normal login
- [ ] Handle 2FA login flow
- [ ] Store tokens securely
- [ ] Handle rate limiting
- [ ] Show error messages

### Token Management
- [ ] Add access token to headers
- [ ] Implement token refresh logic
- [ ] Handle 401 errors automatically
- [ ] Retry failed requests
- [ ] Handle refresh token expiry
- [ ] Clear tokens on logout

### Protected Routes
- [ ] Check authentication status
- [ ] Redirect unauthenticated users
- [ ] Fetch user profile
- [ ] Display user data
- [ ] Handle token expiry

### Password Reset
- [ ] Create forgot password form
- [ ] Show success message
- [ ] Create reset password form
- [ ] Validate token in URL
- [ ] Handle expired tokens
- [ ] Redirect to login on success

### 2FA Setup
- [ ] Create 2FA enable button
- [ ] Display QR code
- [ ] Show secret key
- [ ] Display backup codes
- [ ] Create verification form
- [ ] Handle invalid codes
- [ ] Update user state

### 2FA Login
- [ ] Detect 2FA requirement
- [ ] Show code input form
- [ ] Handle backup code option
- [ ] Validate code format
- [ ] Handle rate limiting
- [ ] Complete login on success

### Error Handling
- [ ] Create error display component
- [ ] Handle network errors
- [ ] Show validation errors
- [ ] Display rate limit messages
- [ ] Handle API errors gracefully

---

## Testing Scenarios

### 1. Happy Path Testing
- [ ] Register new user
- [ ] Login successfully
- [ ] Access protected route
- [ ] Refresh token automatically
- [ ] Update profile
- [ ] Change password
- [ ] Logout successfully

### 2. Error Testing
- [ ] Register with existing email
- [ ] Login with wrong password
- [ ] Use expired access token
- [ ] Use expired refresh token
- [ ] Reset password with invalid token
- [ ] Verify 2FA with wrong code

### 3. Edge Cases
- [ ] Token expires during request
- [ ] Multiple tabs/windows
- [ ] Network disconnection
- [ ] Rapid successive requests
- [ ] Browser back/forward
- [ ] Page refresh

### 4. Security Testing
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] CSRF attempts
- [ ] Rate limiting triggers
- [ ] Token manipulation
- [ ] Invalid token formats

---

## Troubleshooting Guide

### Common Issues

**Issue: 401 Unauthorized on all requests**
- Check if access token is being sent
- Verify token format: `Bearer {token}`
- Check if token is expired
- Ensure token is stored correctly

**Issue: Token refresh fails**
- Verify refresh token is valid
- Check if refresh token expired (7 days)
- Ensure refresh token wasn't revoked
- Try logging in again

**Issue: 2FA codes not working**
- Verify time sync on device
- Check if code is 6 digits
- Ensure setup was completed
- Try backup code instead

**Issue: Email not received**
- Check spam/junk folder
- Verify email address is correct
- Check rate limiting (3 per hour)
- Try again after waiting period

**Issue: Password reset link expired**
- Links expire after 1 hour
- Request new reset link
- Use link immediately after receiving

---

## API Versioning

**Current Version:** v1

**Base URL Pattern:**
```
https://auth-demo-api.example.com/api/v1/auth/*
```

**Version Strategy:**
- Major version in URL path
- Breaking changes require new version
- Old versions supported for 6 months
- Deprecation notices in headers

**Version Headers:**
```
X-API-Version: 1.0.0
X-API-Deprecated: false
```

---

## Support & Resources

**Documentation:**
- API Docs: https://docs.yourapp.com/api
- Authentication Guide: https://docs.yourapp.com/auth
- Frontend Examples: https://github.com/yourapp/examples

**Tools:**
- Postman Collection: [Import from file]
- API Playground: https://playground.yourapp.com
- Token Decoder: https://jwt.io

**Contact:**
- Support Email: support@yourapp.com
- Developer Slack: #api-support
- GitHub Issues: https://github.com/yourapp/api/issues

---

## Changelog

**Version 1.0.0 (2024-02-02)**
- Initial release
- Complete authentication system
- 2FA support
- Password reset flow
- Token refresh mechanism

---

**Last Updated:** February 2, 2024  
**Document Version:** 1.0.0  
**API Version:** v1.0.0