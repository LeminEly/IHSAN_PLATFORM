import express from 'express';
import { getPublicDashboard, getPublicTransaction, verifyBlockchainProof, getMapData } from '../../controllers/public/dashboard.js';
import { getAvailableNeeds, getNeedById } from '../../controllers/donor/catalog.js';
import { optionalAuthenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', getPublicDashboard);
router.get('/map', getMapData);

// Catalog routes made public (Binance-style)
router.get('/needs', optionalAuthenticate, getAvailableNeeds);
router.get('/needs/:needId', optionalAuthenticate, getNeedById);

router.get('/transactions/:id', getPublicTransaction);
router.get('/verify/:hash', verifyBlockchainProof);

export default router;