# 🌙 IHSAN Platform - Backend API

**"Transparency as the Pillar of Charity"**

The IHSAN Platform is a decentralized, high-transparency social aid system built for the Mauritanian market. It connects donors directly to specific needs identified by field validators and fulfilled by local partners, with every transaction recorded on the blockchain for absolute trust.

## 🚀 Key Features

- **Binance-style Transparency**: Public dashboard showing real-time impact and verified transactions.
- **Blockchain Verification**: Every donation generates a cryptographic proof on the **Polygon (Amoy)** network.
- **Localized SMS**: Integrated with **Chinguisoft** for secure OTP verification in Mauritania.
- **Multi-Role Ecosystem**: Robust RBAC for Admins, Validators, Partners, and Donors.
- **Production-Ready Pipeline**: Optimized images via **Sharp** + **Cloudinary**, and cloud database with **Supabase**.

## 🛠️ Technology Stack

- **Runtime**: Node.js / Express
- **Database**: PostgreSQL (Managed by Supabase)
- **ORM**: Sequelize (with automated migrations/sync)
- **Blockchain**: Polygon (ethers.js)
- **Image Processing**: Multer (In-memory) + Sharp + Cloudinary
- **SMS/OTP**: Chinguisoft Validation API
- **Push Notifications**: OneSignal
- **Security**: Helmet, CORS, Rate Limiting, JWT (HS256)

## 📦 Setting Up

### Prerequisites
- Node.js v18+
- PostgreSQL or Supabase Account
- Cloudinary & Chinguisoft API Keys

### Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/ihsan-backend.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your real credentials
```

### Database Seeding
Initialize the platform with a Super Admin and test roles:
```bash
node tests/seed_db.js
```

### Running Locally
```bash
npm run dev
```

## 🧪 Verification & Testing

The platform includes a 100% automated end-to-end verification suite:
```bash
# Runs Public -> Auth -> Need -> Approval -> Donation flow
node tests/global_verification.js
```

## 📄 Documentation

- **API Reference**: Detailed endpoint documentation in [API_REFERENCE.md](./API_REFERENCE.md).
- **Deployment Guide**: Step-by-step Render/Supabase guide in the [brain artifacts](file:///home/kali/.gemini/antigravity/brain/b24b679c-be58-4cc2-80ae-3122b70e65c8/render_deployment_guide.md).

---
**Build for Impact.** 🇲🇷
