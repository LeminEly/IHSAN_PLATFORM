import express from 'express';
import multer from 'multer';
import { register, verifyPhone, resendCode } from '../../controllers/auth/register.js';
import { login, refreshToken, logout } from '../../controllers/auth/login.js';
import { authenticate } from '../../middleware/auth.js';
import { validate, registerValidator, loginValidator, verifyPhoneValidator } from '../../middleware/validation.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.post(
  '/register',
  upload.fields([
    { name: 'id_card', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'commerce_registry', maxCount: 1 }
  ]),
  validate(registerValidator),
  register
);

router.post('/login', validate(loginValidator), login);
router.post('/verify-phone', validate(verifyPhoneValidator), verifyPhone);
router.post('/resend-code', resendCode);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);

export default router;