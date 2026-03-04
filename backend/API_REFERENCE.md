# IHSAN Platform - API Reference

Base URL: `https://your-api-url.onrender.com/api/v1`

## 🔐 Authentication
Most routes require a JWT token in the header: `Authorization: Bearer <token>`

---

## 🌍 Public Routes (No Auth required)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/public/dashboard` | Stats globally (donations, transactions, etc.) |
| `GET` | `/public/map` | Data for the heatmap/impact map |
| `GET` | `/public/needs` | List all available needs (Binance-style) |
| `GET` | `/public/needs/:needId` | Detail of a specific need |
| `GET` | `/public/verify/:hash` | Verify a transaction on the blockchain |

## 👤 Auth Routes
| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `{ full_name, phone, role, password }` | Register a new user |
| `POST` | `/auth/login` | `{ phone, password }` | Login and get token |
| `POST` | `/auth/refresh` | `{ refreshToken }` | Get a new access token |

## 🎁 Donor Routes
| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/donor/needs/:needId/fund` | `{ donor_phone, payment_method }` | Fund a need (Guest ok) |
| `GET` | `/donor/donations` | - | My donation history (Auth req) |
| `GET` | `/donor/donations/stats` | - | My impact stats |

## 🔍 Validator Routes
| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/validator/needs` | `{ title, description, amount, partner_id, ... }` | Submit a new need |
| `GET` | `/validator/needs/pending` | - | Needs waiting for admin approval |
| `POST` | `/validator/delivery/confirm` | `FormData (photo, transaction_id)` | Confirm delivery with photo |

## 🤝 Partner Routes
| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/partner/orders` | - | List of funded needs to prepare |
| `PATCH` | `/partner/orders/:id/status` | `{ status }` | Update order status (ready, etc.) |

## 🛡️ Admin Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | Global admin dashboard stats |
| `GET` | `/admin/needs/pending` | List needs for approval |
| `POST` | `/admin/needs/:needId/approve` | Approve a validator's need |
| `GET` | `/admin/validators/pending` | New validators to approve |
| `GET` | `/admin/partners/pending` | New partners to approve |

---
*Generated for the IHSAN Frontend Team*
