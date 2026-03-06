import express from 'express';
import authRoutes from './v1/auth.js';
import adminRoutes from './v1/admin.js';
import validatorRoutes from './v1/validator.js';
import donorRoutes from './v1/donor.js';
import partnerRoutes from './v1/partner.js';
import publicRoutes from './v1/public.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/validator', validatorRoutes);
router.use('/donor', donorRoutes);
router.use('/partner', partnerRoutes);
router.use('/public', publicRoutes);

export default router;
