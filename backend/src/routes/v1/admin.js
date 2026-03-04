import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { getPendingValidators, approveValidator, rejectValidator, suspendValidator } from '../../controllers/admin/validators.js';
import { getPendingPartners, approvePartner, rejectPartner, recordSiteVisit, getAllPartners } from '../../controllers/admin/partners.js';
import { getAdminStats, suspendUser, activateUser } from '../../controllers/admin/users.js';
import { getPendingNeeds, approveNeed, rejectNeed } from '../../controllers/admin/needs.js';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/stats', getAdminStats);

router.get('/needs/pending', getPendingNeeds);
router.put('/needs/:needId/approve', approveNeed);
router.put('/needs/:needId/reject', rejectNeed);

router.get('/validators/pending', getPendingValidators);
router.put('/validators/:validatorId/approve', approveValidator);
router.put('/validators/:validatorId/reject', rejectValidator);
router.put('/validators/:validatorId/suspend', suspendValidator);

router.get('/partners', getAllPartners);
router.get('/partners/pending', getPendingPartners);
router.put('/partners/:partnerId/approve', approvePartner);
router.put('/partners/:partnerId/reject', rejectPartner);
router.post('/partners/:partnerId/visit', recordSiteVisit);

router.put('/users/:userId/suspend', suspendUser);
router.put('/users/:userId/activate', activateUser);

export default router;