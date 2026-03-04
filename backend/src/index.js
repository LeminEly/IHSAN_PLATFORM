import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import Environment from './config/environment.js';
import { testConnection } from './config/database.js';
import sequelize from './config/database.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/error.js';

// Import models to ensure associations are registered
import './models/User.js';
import './models/Validator.js';
import './models/Partner.js';
import './models/Beneficiary.js';
import './models/Need.js';
import './models/Transaction.js';
import './models/ImpactProof.js';
import './models/Notification.js';
import './models/AdminAction.js';
import './models/VerificationCode.js';
import setupAssociations from './models/associations.js';

// Setup model associations
setupAssociations();

// Validate required environment variables
try {
    Environment.validate();
} catch (err) {
    console.error('❌ Environment error:', err.message);
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const PORT = Environment.get('PORT', 3000);

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = Environment.get('ALLOWED_ORIGINS', Environment.get('CLIENT_URL', '*')).split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Interdit par CORS'));
        }
    },
    credentials: true
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Trop de requêtes, réessayez dans 15 minutes' }
});
app.use('/api/', limiter);

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(Environment.isProduction() ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Client connecté au dashboard public');
    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

app.set('io', io);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: Environment.get('NODE_ENV')
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database & Server Startup ────────────────────────────────────────────────
const startServer = async () => {
    try {
        await testConnection();

        // Sync models in development (use migrations in production)
        if (Environment.isDevelopment()) {
            await sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized');
        }

        server.listen(PORT, () => {
            console.log(`🚀 IHSAN Platform API running on port ${PORT}`);
            console.log(`📡 Environment: ${Environment.get('NODE_ENV')}`);
            console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();

export { app, io };
