# IHSAN — إحسان · Plateforme de Charité Transparente

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org)
[![Blockchain](https://img.shields.io/badge/Blockchain-Polygon%20Amoy-8247E5.svg)](https://polygon.technology)
[![S3C'1447](https://img.shields.io/badge/S3C'1447-Défi%202-gold.svg)](#)

> **"Adore Dieu comme si tu Le voyais"** — Hadith Jibrîl (Fondement du concept *Ihsan*)

**IHSAN** est la première plateforme de charité entièrement traçable de Mauritanie — chaque don est documenté de bout en bout, chaque bénéficiaire est protégé dans sa dignité, chaque transaction est ancrée sur la blockchain.

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Démo](#-démo)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack technique](#-stack-technique)
- [Installation locale](#-installation-locale)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Choix techniques](#-choix-techniques)
- [Sécurité & Conformité](#-sécurité--conformité)
- [Licence](#-licence)

---

## 🎯 Aperçu du projet

### Problème résolu

En Mauritanie, la quasi-totalité des dons du Ramadan se font sans documentation ni traçabilité. Trois problèmes majeurs :

| Problème | Impact |
|---|---|
| **Opacité totale** | Le donneur ne sait pas si son don a atteint sa destination |
| **Perte de dignité** | Les bénéficiaires sont exposés publiquement sans leur consentement |
| **Zéro impact mesurable** | Impossible de mesurer l'efficacité des actions caritatives |

### Solution IHSAN

Un écosystème à 4 acteurs interconnectés :

```
Donneur → Validateur (terrain) → Partenaire (préparation) → Bénéficiaire (anonyme)
   ↓              ↓                       ↓                        ↓
 Mobile         GPS +               Photo floutée             Code anonyme
  Money        Besoin             automatiquement               SHA-256
                  ↓
            Blockchain Polygon — Hash immuable public
```

---

## 🚀 Démo

### Comptes de test

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| Admin | `+22200000001` | `Admin123!` |
| Validateur | `+22200000002` | `Valid123!` |
| Partenaire | `+22200000003` | `Partner123!` |
| Donneur | `+22200000004` | `Donor123!` |

### Flux de démonstration complet

1. **Admin** approuve un validateur et un partenaire (SMS de notification)
2. **Validateur** crée un besoin depuis le terrain (GPS mobile auto-capturé)
3. **Donneur** finance le besoin via Mobile Money (Masrivi)
4. **Validateur** confirme la livraison + upload photo (floutage automatique Cloudinary)
5. Hash SHA-256 généré → lien blockchain public
6. Dashboard public mis à jour en temps réel (Socket.IO)
7. Carte Leaflet affiche le nouveau point (GPS ou fallback par quartier)

---

## ✨ Fonctionnalités

### 👤 Authentification & Rôles
- Inscription multi-étapes avec upload de documents (Cloudinary)
- Vérification téléphonique SMS via **Chinguisoft** (opérateur mauritanien local)
- 4 rôles : `admin`, `validator`, `partner`, `donor`
- JWT avec expiration configurable
- Middleware de validation par rôle

### ✅ Processus de validation
- **Validateurs** : Carte d'identité + selfie + vérification admin manuelle
- **Partenaires** : Registre de commerce + visite terrain documentée
- Système de réputation pour les validateurs (`reputation_score`, `total_deliveries`)
- Notifications SMS à chaque changement de statut

### 💰 Cycle de don complet
- Catalogue de besoins géolocalisés avec filtres (catégorie, quartier, priorité)
- Paiement Mobile Money (Bankily, Masrivi, Sedad, ...) simulé
- Génération de reçu numérique avec numéro unique
- Hash SHA-256 de chaque transaction
- Ancrage optionnel sur Polygon Amoy Testnet
- Fallback automatique si blockchain non configurée

### 📸 Preuve d'impact
- Photo de livraison uploadée par le validateur
- **Floutage automatique** via Cloudinary (transformation `e_blur:800`)
- Stockage URL floutée + thumbnail
- Visible par le donneur sur son reçu

### 🗺 Tableau de bord public
- Statistiques en temps réel (Socket.IO)
- Carte interactive Leaflet des dons confirmés
- Fallback coordonnées par quartier (9 quartiers de Nouakchott)
- Page de vérification de hash public (`/verify/:hash`)
- Transactions récentes en direct

### 🔐 Anonymat des bénéficiaires
- Jamais de nom/prénom stocké publiquement
- Codes de référence anonymes (`BEN-XXXX`)
- Description générale uniquement (ex: "Famille de 4 personnes")

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IHSAN Platform                        │
├──────────────────┬──────────────────┬───────────────────┤
│   Frontend       │    Backend       │   External         │
│   React 18       │   Node.js 18     │   Services         │
│   Tailwind v3    │   Express 5      │                    │
│   Socket.IO      │   Socket.IO      │   📱 Chinguisoft (SMS)  │
│   Leaflet Maps   │   Sequelize ORM  │   ☁️  Cloudinary        │
│   Recharts       │   JWT Auth       │   ⛓  Polygon Amoy       │
│                  │   Multer         │   📡 WebSocket      │
├──────────────────┴──────────────────┴───────────────────┤
│                  PostgreSQL 15 + PostGIS                  │
│   users · validators · partners · needs · transactions   │
│   beneficiaries · impact_proofs · notifications          │
└─────────────────────────────────────────────────────────┘
```

### Structure des dossiers

```
ihsan-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # environment.js, database.js
│   │   ├── controllers/     # auth, admin, validator, donor, partner, public
│   │   ├── middleware/       # auth.js, validation.js, upload.js, error.js
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express routers
│   │   │
│   │   └── services/
│   │       └──sms # Service notification   
│   │       └── notification/  # Service email et push notification
│   │       └── payment/     # Stimulation du payment
│   │       └── blockchain/  # polygon.service.js, interface.js
│   ├── index.js             # Entry point + Socket.IO
│   └── database/
│           ├── migration
│               └── 001_initial_schema.sql  # Schéma complet avec PostGIS
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Admin/       # Dashboard, PendingValidators, PendingPartners, Users
│       │   ├── Auth/        # Login, Register, VerifyPhone
│       │   ├── Donor/       # Catalog, NeedDetail, Fund, Donations, Receipt
│       │   ├── Layout/      # Navbar, Footer
│       │   ├── Partner/     # Orders, OrderDetail, Stats
│       │   ├── Public/      # Home, MapView, TransactionDetail, VerifyHash
│       │   └── Validator/   # Dashboard, CreateNeed, MyNeeds, ConfirmDelivery
│       ├── context/         # AuthContext.js
│       └── services/        # api.js, socket.js
└── docker-compose.yml
```

---

## 🛠 Stack technique

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| React | 18 | Framework UI |
| React Router | 6 | Navigation SPA |
| Tailwind CSS | 3 | Styles utilitaires |
| Leaflet + React-Leaflet | 4 | Cartes interactives |
| Recharts | 2 | Graphiques statistiques |
| Socket.IO Client | 4 | Temps réel |
| Axios | 1 | Appels API |

### Backend
| Technologie | Version | Usage |
|---|---|---|
| Node.js | 18 | Runtime |
| Express | 5 | Framework HTTP |
| Sequelize | 6 | ORM PostgreSQL |
| Socket.IO | 4 | WebSocket |
| JWT | — | Authentification |
| bcrypt | — | Hachage mots de passe |
| Multer | — | Upload fichiers |
| express-validator | — | Validation entrées |
| Helmet + CORS | — | Sécurité HTTP |

### Base de données
| Élément | Détail |
|---|---|
| PostgreSQL | 15 avec extension PostGIS |
| Tables principales | `users`, `validators`, `partners`, `needs`, `transactions`, `beneficiaries`, `impact_proofs`, `notifications` |
| Index | Sur `status`, `location_quarter`, `priority`, `expiry_date`, index spatial GIST |

### Services externes
| Service | Usage | Fallback |
|---|---|---|
| **Chinguisoft** | SMS vérification + notifications (opérateur MR) | Non-bloquant, log si absent |
| **Cloudinary** | Stockage photos + floutage auto (`e_blur:800`) | Erreur si non configuré |
| **Polygon Amoy** | Ancrage hash sur testnet Polygon | SHA-256 local automatique |
| **OneSignal** | Push notifications mobiles | Non-bloquant, log si absent |
| **SendGrid** | Emails de confirmation | Non-bloquant, log si absent |

---

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- PostgreSQL 15 (ou Docker)
- Compte Cloudinary (gratuit)
- Compte Chinguisoft (optionnel — SMS Mauritanie)

### 1. Cloner le repo

```bash
git clone https://github.com/votre-username/ihsan-platform.git
cd ihsan-platform
```

### 2. Base de données

**Avec Docker (recommandé) :**
```bash
docker-compose up -d postgres
```

**Ou manuellement :**
```bash
createdb ihsan_db
psql -d ihsan_db -f database/ihsan_schema.sql
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplir .env (voir section Configuration)
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

L'application démarre sur `http://localhost:3000`

### 5. Créer un admin

```bash
# Dans psql
INSERT INTO users (full_name, phone, password_hash, role, is_active, phone_verified)
VALUES (
  'Admin IHSAN',
  '+22200000001',
  '$2b$10$...',   -- bcrypt de 'Admin123!'
  'admin',
  true,
  true
);
```


---

## ⚙️ Configuration

### Variables d'environnement — `backend/.env`

```env
# ─── Serveur ───────────────────────────────────────────────────────────────────
NODE_ENV=development                    # production en déploiement
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# ─── Base de données ───────────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=ihsan_user                      # Créer avec createuser -P ihsan_user
DB_PASSWORD=VotreMotDePasse!            # ⚠️ Ne jamais committer en clair
DB_NAME=ihsan_dev

# ─── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=generer-avec-openssl-rand-hex-64         # openssl rand -hex 64
JWT_REFRESH_SECRET=generer-avec-openssl-rand-hex-64
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ─── SMS — Chinguisoft (opérateur mauritanien) ─────────────────────────────────
CHINGUIS_VALIDATION_KEY=VotreCleValidation          # Fournie par Chinguisoft
CHINGUIS_VALIDATION_TOKEN=VotreTokenValidation      # Fourni par Chinguisoft

# ─── Push Notifications — OneSignal ───────────────────────────────────────────
ONESIGNAL_APP_ID=votre-app-id-onesignal
ONESIGNAL_REST_API_KEY=votre-rest-api-key

# ─── Email — SendGrid ──────────────────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx            # Depuis dashboard SendGrid
SENDGRID_FROM_EMAIL=votre-email@domaine.com

# ─── Cloudinary (stockage + floutage photos) ───────────────────────────────────
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# ─── Blockchain — Polygon Amoy Testnet ────────────────────────────────────────
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGON_PRIVATE_KEY=0x...               # ⚠️ Wallet de déploiement — ne pas exposer
POLYGON_CONTRACT_ADDRESS=0x...          # Adresse du smart contract déployé
POLYGON_EXPLORER_URL=https://amoy.polygonscan.com
# Si POLYGON_RPC_URL absent → fallback automatique SHA-256 local
```

> **⚠️ Sécurité GitHub** : Ajoutez `backend/.env` à votre `.gitignore`. Ne commitez jamais de secrets réels. Utilisez des variables d'environnement dans votre hébergeur (Railway, Render, etc.).

### Générer des secrets JWT sécurisés

```bash
# JWT_SECRET
openssl rand -hex 64

# JWT_REFRESH_SECRET
openssl rand -hex 64
```

### Créer l'utilisateur PostgreSQL

```sql
CREATE USER ihsan_user WITH PASSWORD 'VotreMotDePasse!';
CREATE DATABASE ihsan_dev OWNER ihsan_user;
GRANT ALL PRIVILEGES ON DATABASE ihsan_dev TO ihsan_user;
```

---

## 🔒 .gitignore recommandé

Créez un fichier `backend/.gitignore` contenant :

```
.env
node_modules/
uploads/
*.log
```

Et un `backend/.env.example` (sans valeurs réelles) à committer à la place, en copiant la structure ci-dessus avec des valeurs vides.

---

## 📡 API Reference

### Auth
```
POST   /api/auth/register          Inscription (multipart/form-data)
POST   /api/auth/login             Connexion → JWT
POST   /api/auth/verify-phone      Vérification code SMS
GET    /api/auth/me                Profil connecté
```

### Admin `[JWT: admin]`
```
GET    /api/admin/stats
GET    /api/admin/validators/pending
PUT    /api/admin/validators/:id/approve
PUT    /api/admin/validators/:id/reject
GET    /api/admin/partners/pending
PUT    /api/admin/partners/:id/approve
PUT    /api/admin/partners/:id/reject
POST   /api/admin/partners/:id/site-visit
GET    /api/admin/users
PUT    /api/admin/users/:id/suspend
PUT    /api/admin/users/:id/activate
```

### Validator `[JWT: validator]`
```
GET    /api/validator/stats
GET    /api/validator/needs               Mes besoins créés
POST   /api/validator/needs               Créer un besoin
GET    /api/validator/needs/to-confirm    Besoins à confirmer
POST   /api/validator/needs/:id/confirm   Confirmer livraison (photo)
POST   /api/validator/beneficiaries       Enregistrer bénéficiaire
GET    /api/validator/partners            Liste partenaires approuvés
```

### Donor `[JWT: donor]`
```
GET    /api/donor/needs                   Catalogue (filtres: category, quarter, sort)
GET    /api/donor/needs/:id               Détail besoin
POST   /api/donor/needs/:id/fund          Financer un besoin
GET    /api/donor/donations               Mes dons
GET    /api/donor/donations/stats         Statistiques dons
GET    /api/donor/donations/:id/receipt   Reçu
```

### Partner `[JWT: partner]`
```
GET    /api/partner/orders                Commandes assignées
GET    /api/partner/orders/:id            Détail commande
PUT    /api/partner/orders/:id/status     Mise à jour statut
GET    /api/partner/stats                 Statistiques
```

### Public `[Sans authentification]`
```
GET    /api/public/dashboard              Stats + transactions récentes
GET    /api/public/map                    Points carte (GPS + fallback quartier)
GET    /api/public/transactions/:id       Détail transaction publique
GET    /api/public/verify/:hash           Vérifier un hash blockchain
```

---

## 🧠 Choix techniques

### Pourquoi SHA-256 + Polygon en fallback ?

La blockchain Polygon Amoy est utilisée quand `POLYGON_RPC_URL` est configuré. Sans configuration, le système bascule automatiquement en SHA-256 local — ce qui garantit que la plateforme fonctionne en démo sans dépendance externe, tout en étant prête pour la production.

```javascript
// polygon.service.js — Mode automatique
if (this.enabled) {
  // Ancrage Polygon → explorer_url: amoy.polygonscan.com/tx/...
} else {
  // SHA-256 local → explorer_url: frontend/verify/:hash
}
```

### Pourquoi le floutage côté Cloudinary et non côté serveur ?

Le floutage via la transformation Cloudinary (`e_blur:800,r_max`) est :
- **Irréversible** : l'URL floutée ne peut pas être "déflouttée"
- **Sans stockage de l'original** : seule l'URL floutée est stockée en base
- **Scalable** : pas de traitement image côté serveur

### Pourquoi le fallback GPS par quartier ?

En Mauritanie, la plupart des validateurs sont sur mobile avec GPS parfois indisponible. Le fallback garantit que **toutes** les transactions apparaissent sur la carte publique — avec un indicateur visuel "⚠ Position approximative" pour distinguer les coordonnées précises des approximations.

### Architecture Socket.IO

Le dashboard public se met à jour en temps réel sans polling :
```
Transaction confirmée
    ↓ backend émet
socket.emit('new-transaction', data)
socket.emit('stats-updated', stats)
    ↓ frontend reçoit
setTransactions(prev => [newTx, ...prev])
setStats(newStats)
```

---

## 🔐 Sécurité & Conformité

| Mesure | Implémentation |
|---|---|
| Authentification | JWT HS256 avec expiration |
| Mots de passe | bcrypt (salt rounds: 10) |
| Fichiers | Type MIME + taille max (10MB) |
| API | Helmet, CORS restreint, rate limiting |
| Données sensibles | Bénéficiaires jamais exposés publiquement |
| Photos | Floutage automatique avant stockage |
| Blockchain | Hash immuable = non-répudiation |

---

## 📊 Schéma de base de données

```sql
users (id, full_name, phone, password_hash, role, is_active, phone_verified)
  ├── validators (user_id, id_card_url, selfie_url, verification_status, reputation_score)
  ├── partners (user_id, business_name, address, commerce_registry_url, verification_status)
  └── beneficiaries (reference_code, registered_by, description, family_size, location_*)

needs (id, validator_id, partner_id, beneficiary_id, title, description,
       estimated_amount, category, priority, status, location_quarter, location_lat, location_lng)
  └── transactions (id, need_id, donor_id, amount, status, receipt_number,
                    blockchain_hash, blockchain_tx_hash, confirmed_at)
        └── impact_proofs (transaction_id, media_url, thumbnail_url, proof_type)

notifications (user_id, type, message, channel, sent_at)
```

---

## 🤝 Contribution

Ce projet a été développé dans le cadre du **S3C'1447 Défi 2 — Ramadan 1447**.

Pour contribuer :
1. Fork le repo
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit (`git commit -m 'feat: description'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT License — voir [LICENSE](LICENSE)

---

<div align="center">

**IHSAN · إحسان**

*Chaque don mérite d'être vu. Chaque bénéficiaire mérite sa dignité.*

`React` · `Node.js` · `PostgreSQL` · `Cloudinary` · `Chinguisoft` · `OneSignal` · `SendGrid` · `Polygon Amoy` · `Socket.IO` · `Leaflet`

</div>
