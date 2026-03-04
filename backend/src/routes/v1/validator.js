import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { requireVerifiedValidator } from '../../middleware/validator.js';
import { upload } from '../../middleware/upload.js';
import { validate, needValidator } from '../../middleware/validation.js';
import { createNeed, getMyNeeds, getNeedsToConfirm, getValidatorStats } from '../../controllers/validator/needs.js';
import { confirmDelivery, registerBeneficiary } from '../../controllers/validator/delivery.js';

const router = express.Router();

router.use(authenticate, requireRole('validator'));

router.get('/stats', getValidatorStats);
router.get('/needs', getMyNeeds);
router.get('/needs/to-confirm', getNeedsToConfirm);

router.post('/needs', validate(needValidator), createNeed);
router.post('/beneficiaries', registerBeneficiary);

router.post(
  '/needs/:needId/confirm',
  requireVerifiedValidator,
  upload.single('proof_photo'),
  confirmDelivery
);

export default router;