import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { getAvailableNeeds, getNeedById, searchNeeds } from '../../controllers/donor/catalog.js';
import { fundNeed, getMyDonations, getDonationReceipt, getDonationStats } from '../../controllers/donor/donations.js';

const router = express.Router();

router.get('/needs', optionalAuthenticate, getAvailableNeeds);
router.get('/needs/search', optionalAuthenticate, searchNeeds);
router.get('/needs/:needId', optionalAuthenticate, getNeedById);

router.post('/needs/:needId/fund', optionalAuthenticate, fundNeed);

router.get('/donations', getMyDonations);
router.get('/donations/stats', getDonationStats);
router.get('/donations/:transactionId/receipt', getDonationReceipt);

export default router;