import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
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

const allowedOrigins = [
  Environment.get('CLIENT_URL'),
  'https://ihsan-platform-supnum.netlify.app',
  'http://localhost:3000'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: mobile, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqué pour: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rendre io accessible dans les controllers
app.set('io', io);

// Routes API 
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

// Socket.IO 
io.on('connection', (socket) => {
  console.log('Client connecté au dashboard public');
  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

// Démarrage 
const PORT = Environment.get('PORT', 5000);
const start = async () => {
  await testConnection();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/v1`);
    console.log(`✅ CORS autorisé pour: ${allowedOrigins.join(', ')}`);
  });
};
start();
