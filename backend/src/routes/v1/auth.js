import express from 'express';
import { register, login, verifyPhone, resendCode, refreshToken, logout } from '../../controllers/auth/register.js';
import { authenticate } from '../../middleware/auth.js';
import { validate, registerValidator, loginValidator, verifyPhoneValidator } from '../../middleware/validation.js';

const router = express.Router();

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.post('/verify-phone', validate(verifyPhoneValidator), verifyPhone);
router.post('/resend-code', resendCode);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);

export default router;