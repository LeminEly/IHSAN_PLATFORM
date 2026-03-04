import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { getPendingValidators, approveValidator, rejectValidator, suspendValidator } from '../../controllers/admin/validators.js';
import { getPendingPartners, approvePartner, rejectPartner, recordSiteVisit } from '../../controllers/admin/partners.js';
import { getAdminStats, suspendUser, activateUser } from '../../controllers/admin/users.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/stats', getAdminStats);

router.get('/validators/pending', getPendingValidators);
router.put('/validators/:validatorId/approve', approveValidator);
router.put('/validators/:validatorId/reject', rejectValidator);
router.put('/validators/:validatorId/suspend', suspendValidator);

router.get('/partners/pending', getPendingPartners);
router.put('/partners/:partnerId/approve', approvePartner);
router.put('/partners/:partnerId/reject', rejectPartner);
router.post('/partners/:partnerId/visit', recordSiteVisit);

router.put('/users/:userId/suspend', suspendUser);
router.put('/users/:userId/activate', activateUser);

export default router;