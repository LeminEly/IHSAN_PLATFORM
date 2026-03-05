import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { requireVerifiedValidator } from '../../middleware/validator.js';
import { upload } from '../../middleware/upload.js';
import { validate, needValidator } from '../../middleware/validation.js';
import { createNeed, getMyNeeds, getNeedsToConfirm, getValidatorStats } from '../../controllers/validator/needs.js';
import { confirmDelivery, registerBeneficiary } from '../../controllers/validator/delivery.js';
import Partner from '../../models/Partner.js';

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

// Liste des partenaires approuvés (pour le formulaire CreateNeed)
router.get('/partners', async (req, res) => {
  try {
    const partners = await Partner.findAll({
      where: { verification_status: 'approved' },
      attributes: ['id', 'business_name', 'address', 'payment_phone', 'payment_operator']
    });
    res.json(partners);
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Erreur chargement partenaires' });
  }
});

export default router;