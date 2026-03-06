import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import {
  getPartnerOrders,
  updateOrderStatus,
  getPartnerStats,
} from '../../controllers/partner/orders.js';

const router = express.Router();

router.use(authenticate, requireRole('partner'));

router.get('/orders', getPartnerOrders);
router.get('/stats', getPartnerStats);
router.put('/orders/:orderId/status', updateOrderStatus);

export default router;
