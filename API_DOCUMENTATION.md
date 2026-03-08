# API Endpoint Documentation - Updated

## Authentication Endpoints

### 1. Send Verification Code
**Endpoint:** `POST /api/auth/send-verification-code`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Validation:**
- ✅ Email is required
- ✅ Email must be valid format
- ✅ Account must not already exist

**Response:** `200 OK`
```json
"Verification code sent"
```

**Error Cases:**
```json
{
  "error": "An account with this email already exists"
}
```

---

### 2. Verify Email Code
**Endpoint:** `POST /api/auth/verify-email-code`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Validation:**
- ✅ Email is required
- ✅ Code must be exactly 6 digits
- ✅ Code must not be expired (15 min expiry)

**Response:** `200 OK`
```json
"Email verified"
```

---

### 3. Signup (Create User)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "role": "DRIVER"
}
```

**Validation:**
- ✅ Name: 2-100 characters
- ✅ Email: valid format
- ✅ Phone: must be exactly 10 digits
- ✅ Role: ADMIN | SYSTEM_USER | APPROVER | DRIVER

**Response:** `200 OK`
```json
{
  "token": null,
  "role": "DRIVER",
  "name": "John Doe",
  "email": "john@example.com",
  "id": 1
}
```

**Note:** Password is auto-generated and emailed to user, NOT returned in response.

---

### 4. Authenticate (Login)
**Endpoint:** `POST /api/auth/authenticate`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Temp1234!"
}
```

**Validation:**
- ✅ Email and password both required
- ✅ Credentials must be correct

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "DRIVER",
  "name": "John Doe",
  "email": "john@example.com",
  "id": 1,
  "passwordChangeRequired": true
}
```

---

### 5. Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation:**
- ✅ Email is required
- ✅ Email must exist in system

**Response:** `200 OK`
```json
"Password reset code sent to your email"
```

---

### 6. Verify OTP (For Password Reset)
**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "123456"
}
```

**Validation:**
- ✅ Email is required
- ✅ Token must be 6 digits
- ✅ Token must not be expired

**Response:** `200 OK`
```json
"OTP verified successfully"
```

---

### 7. Reset Password
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "123456",
  "password": "NewPassword123!"
}
```

**Validation:**
- ✅ Email is required
- ✅ Token must be valid and not expired
- ✅ Password must be at least 8 characters

**Response:** `200 OK`
```json
"Password has been reset"
```

---

### 8. Change Password
**Endpoint:** `POST /api/auth/change-password`
**Authorization:** Required (Bearer token)

**Request Body:**
```json
{
  "userId": 1,
  "newPassword": "NewChangePassword123!"
}
```

**Validation:**
- ✅ Requires authentication
- ✅ User ID is required
- ✅ Password must be at least 8 characters

**Response:** `200 OK`
```json
"Password changed successfully"
```

---

## Fuel Management Endpoints

### 1. Get All Fuel Records
**Endpoint:** `GET /api/fuel`
**Authorization:** Required (ADMIN, SYSTEM_USER, APPROVER)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "vehicleId": 1,
    "driverId": 2,
    "quantity": 45.5,
    "cost": 2275.00,
    "pricePerLiter": 50.00,
    "mileage": 50120.5,
    "stationName": "Shell Station",
    "receiptPath": "uploads/receipts/uuid.jpg",
    "date": "2024-03-08",
    "createdAt": "2024-03-08"
  }
]
```

---

### 2. Create Fuel Record
**Endpoint:** `POST /api/fuel`
**Authorization:** Required (ADMIN, DRIVER)

**Request Body:**
```json
{
  "vehicleId": 1,
  "driverId": 2,
  "quantity": 45.5,
  "cost": 2275.00,
  "pricePerLiter": 50.00,
  "mileage": 50120.5,
  "stationName": "Shell Station",
  "receiptPath": "uploads/receipts/uuid.jpg",
  "date": "2024-03-08"
}
```

**Validation:**
- ✅ Vehicle ID is required
- ✅ Quantity must be > 0
- ✅ Cost must be >= 0
- ✅ `pricePerLiter` auto-calculated if not provided
- ✅ All invalid data returns `400 Bad Request`

**Response:** `200 OK`
```json
{
  "id": 2,
  "vehicleId": 1,
  "driverId": 2,
  "quantity": 45.5,
  "cost": 2275.00,
  "pricePerLiter": 50.00,
  "mileage": 50120.5,
  "stationName": "Shell Station",
  "receiptPath": "uploads/receipts/uuid.jpg",
  "date": "2024-03-08",
  "createdAt": "2024-03-08"
}
```

**Error Cases:**
```json
{
  "error": "Vehicle ID, quantity, and cost are required"
}
```
```json
{
  "error": "Quantity and cost must be positive values"
}
```

---

### 3. Get Fuel Records by Vehicle
**Endpoint:** `GET /api/fuel/vehicle/{vehicleId}`
**Authorization:** Required (ADMIN, SYSTEM_USER, APPROVER)

**Path Parameters:**
- `vehicleId` (Integer): Vehicle ID

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "vehicleId": 1,
    "quantity": 45.5,
    "cost": 2275.00,
    "pricePerLiter": 50.00,
    ...
  }
]
```

---

### 4. Upload Receipt
**Endpoint:** `POST /api/fuel/upload-receipt`
**Authorization:** Required (ADMIN, DRIVER)
**Content-Type:** `multipart/form-data`

**Request:**
```
Form Data:
  file: (binary) - receipt image or PDF
```

**Validation:**
- ✅ File required
- ✅ File size <= 5MB
- ✅ File type: .jpg, .jpeg, .png, .pdf only
- ✅ Filename sanitized (UUID rename)

**Response:** `200 OK`
```json
{
  "receiptPath": "uploads/receipts/550e8400-e29b-41d4-a716-446655440000.pdf",
  "message": "Receipt uploaded successfully"
}
```

**Error Cases:**
```json
{
  "error": "File is empty"
}
```
```json
{
  "error": "File size exceeds 5MB limit"
}
```
```json
{
  "error": "Only JPG, PNG, and PDF files are allowed"
}
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Fuel record created, email sent |
| 400 | Bad Request | Invalid input, missing fields |
| 401 | Unauthorized | No token, invalid token |
| 403 | Forbidden | Token valid but insufficient permission |
| 500 | Server Error | Unexpected error |

---

## Authorization Overview

| Endpoint | ADMIN | DRIVER | APPROVER | SYSTEM_USER |
|----------|-------|--------|----------|-------------|
| POST /auth/authenticate | ✅ | ✅ | ✅ | ✅ |
| POST /auth/change-password | ✅ | ✅ | ✅ | ✅ |
| GET /fuel | ✅ | ❌ | ✅ | ✅ |
| POST /fuel | ✅ | ✅ | ❌ | ❌ |
| GET /fuel/vehicle/{id} | ✅ | ❌ | ✅ | ✅ |
| POST /fuel/upload-receipt | ✅ | ✅ | ❌ | ❌ |
| GET /users | ✅ | ❌ | ❌ | ✅ |
| DELETE /users/{id} | ✅ | ❌ | ❌ | ❌ |

---

## Example Complete Flow: Fuel Entry

**Step 1: Login**
```bash
curl -X POST http://localhost:8080/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@example.com","password":"Temp1234!"}'
# Response includes: token, role, passwordChangeRequired
```

**Step 2: Upload Receipt** (Optional)
```bash
TOKEN="eyJhbGc..."

curl -X POST http://localhost:8080/api/fuel/upload-receipt \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@receipt.pdf"
# Response includes: receiptPath
```

**Step 3: Create Fuel Record**
```bash
curl -X POST http://localhost:8080/api/fuel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "driverId": 2,
    "quantity": 45.5,
    "cost": 2275.00,
    "mileage": 50120.5,
    "stationName": "Shell Station",
    "receiptPath": "uploads/receipts/uuid.pdf",
    "date": "2024-03-08"
  }'
# Response includes: saved record with ID
```

---

## Important Notes

1. **Password in Signup**: Auto-generated and emailed to user. NOT returned in API response.
2. **Price Per Liter**: Auto-calculated from cost/quantity if not provided.
3. **OTP Expiry**: 15 minutes for both email verification and password reset.
4. **Token Expiry**: JWT token expires after 24 hours.
5. **CORS**: Restricted to configured origins only (environment variable).
6. **Error Messages**: Do not leak sensitive information.

---

## Changes from Previous Version

| Aspect | Previous | Current |
|--------|----------|---------|
| Email Endpoint | `Map<String,String>` | `SendVerificationRequest` DTO |
| Code Endpoint | `Map<String,String>` | `VerifyEmailCodeRequest` DTO |
| Forgot Password | `Map<String,String>` | `ForgotPasswordRequest` DTO |
| Change Password | No validation | Min 8 chars validation |
| Fuel Authorization | No checks | Role-based (ADMIN, DRIVER) |
| File Upload | No sanitization | UUID rename + extension check |
| Debug Logging | Present | Removed |
| Credentials | Hardcoded | Environment variables |
