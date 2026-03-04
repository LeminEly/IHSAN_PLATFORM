import express from 'express';
import { getPublicDashboard, getPublicTransaction, verifyBlockchainProof, getMapData } from '../../controllers/public/dashboard.js';

const router = express.Router();

router.get('/dashboard', getPublicDashboard);
router.get('/map', getMapData);
router.get('/transactions/:id', getPublicTransaction);
router.get('/verify/:hash', verifyBlockchainProof);

export default router;