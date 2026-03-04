# 📖 IHSAN Platform - API Reference v1.0

This document provides a comprehensive guide to the IHSAN Platform Backend API. Designed for the frontend team and external integrators.

## 🔗 Base URL
- **Local**: `http://localhost:3000/api/v1`
- **Production**: `https://ihsan-backend.onrender.com/api/v1`

## 🔐 Authentication & Security

### JWT Authentication
Most endpoints require a JSON Web Token (JWT).
- **Header**: `Authorization: Bearer <your_jwt_token>`
- **Token Type**: Bearer

### Role-Based Access Control (RBAC)
The API uses strict RBAC. Ensure your user has the appropriate role:
- `admin`: Full platform management.
- `validator`: Field agents who identify and verify needs.
- `partner`: Merchants/Shops providing the goods.
- `donor`: Authenticated donors (guest donations are also supported).

---

## 🌍 Public API (No Auth Required)
These routes are designed for the "Binance-style" transparency dashboard.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/public/dashboard` | Returns global stats (total donations, top categories, etc.). |
| `GET` | `/public/needs` | Catalog of all **Open** needs. |
| `GET` | `/public/needs/:needId` | Full details of a specific need. |
| `GET` | `/public/map` | Geo-data for the impact map. |
| `GET` | `/public/transactions/:id` | Public receipt for a specific donation. |
| `GET` | `/public/verify/:hash` | Verifies a donation proof against the Polygon Blockchain. |

---

## 👤 Authentication Endpoints (`/auth`)
Handled by the Chinguisoft SMS service for OTP verification.

### Register
`POST /auth/register`
- **Payload**:
```json
{
  "full_name": "Ahmed Mauritanie",
  "phone": "+222xxxxxxxx",
  "password": "secure_password",
  "role": "validator" 
}
```
- **Note**: Roles can be `validator`, `partner`, or `donor`. Admins are created via seeder.

### Login
`POST /auth/login`
- **Payload**: `{ "phone": "+222xxxxxxxx", "password": "..." }`
- **Response**: `{ "token": "...", "user": { ... } }`

### Verify Phone (OTP)
`POST /auth/verify-phone`
- **Payload**: `{ "phone": "+222xxxxxxxx", "code": "123456" }`

---

## 🔍 Validator Endpoints (`/validator`)
*Requires `validator` role + Approved Profile.*

### Submit a Need
`POST /validator/needs`
- **Payload**:
```json
{
  "title": "Aide Alimentaire Arafat",
  "description": "Besoin urgent d'un panier repas",
  "estimated_amount": 5000,
  "category": "food_basket",
  "partner_id": "UUID",
  "location_quarter": "Arafat",
  "priority": 3,
  "beneficiary_description": "Famille de 6 personnes",
  "family_size": 6
}
```

### Confirm Delivery (Photo Proof)
`POST /validator/needs/:needId/confirm`
- **Type**: `multipart/form-data`
- **Field**: `proof_photo` (Image file)
- **Constraint**: Must be an approved validator.

---

## 🛡️ Admin Endpoints (`/admin`)
*Requires `admin` role.*

### Approve Need
`PUT /admin/needs/:needId/approve`
- **Payload**: `{ "reason": "Documents vérifiés" }`

### Manage Partners
- `GET /admin/partners`: List all partners.
- `GET /admin/partners/pending`: New requests.
- `PUT /admin/partners/:id/approve`: Approve partner profile.

---

## 🎁 Donor Endpoints (`/donor`)
*Guest donations supported. History requires login.*

### Fund a Need (The Gift)
`POST /donor/needs/:needId/fund`
- **Payload**:
```json
{
  "donor_phone": "+22248888888",
  "payment_method": "mobile_money"
}
```
- **Response**: Returns a unique `receipt_number` and `blockchain_hash`.

---

## 🤝 Partner Endpoints (`/partner`)
*Requires `partner` role.*

### Orders & Status
- `GET /partner/orders`: Needs funded for the partner.
- `PUT /partner/orders/:id/status`: Update to `ready` for pickup.

---

### � Integration Tips
1. **Phone Format**: Always use `+222` prefix for Mauritanian numbers.
2. **Category Enums**: `iftar_meal`, `food_basket`, `clothing`, `medical`, `other`.
3. **Status Flow**: `pending` → `open` → `funded` → `completed`.
