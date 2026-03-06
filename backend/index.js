import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

import Environment from './src/config/environment.js';
import { testConnection } from './src/config/database.js';

import './src/models/Relations.js';

import authRoutes from './src/routes/v1/auth.js';
import adminRoutes from './src/routes/v1/admin.js';
import validatorRoutes from './src/routes/v1/validator.js';
import donorRoutes from './src/routes/v1/donor.js';
import partnerRoutes from './src/routes/v1/partner.js';
import publicRoutes from './src/routes/v1/public.js';

Environment.validate();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: Environment.get('CLIENT_URL', 'http://localhost:3000'),
    credentials: true
  }
});

// ─── Middlewares ───────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});

// Appliquer le limiter à toutes les routes /api
app.use('/api/', limiter);

app.use(cors({
  origin: Environment.get('CLIENT_URL', 'http://localhost:3000'),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rendre io accessible dans les controllers
app.set('io', io);

// ─── Routes API ────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/validator', validatorRoutes);
app.use('/api/v1/donor', donorRoutes);
app.use('/api/v1/partner', partnerRoutes);
app.use('/api/v1/public', publicRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} non trouvée` });
});

// Erreurs globales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne'
  });
});

// ─── Socket.IO ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connecté au dashboard public');
  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

// ─── Démarrage ─────────────────────────────────────────────
const PORT = Environment.get('PORT', 5000);

const start = async () => {
  await testConnection();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/v1`);
  });
};

start();