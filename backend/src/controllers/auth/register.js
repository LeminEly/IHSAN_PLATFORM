import User from '../../models/User.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import VerificationCode from '../../models/VerificationCode.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Environment from '../../config/environment.js';
import smsService from '../../services/sms/index.js';
import { validateMauritaniaPhone } from '../../utils/validation.js';

export const register = async (req, res, next) => {
  try {
    const { full_name, phone, email, password, role, documents } = req.body;

    // 1. Valider le numéro de téléphone mauritanien
    const phoneValidation = validateMauritaniaPhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        error: phoneValidation.error
      });
    }

    const formattedPhone = phoneValidation.formatted;

    // 2. Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({
      where: { phone: formattedPhone }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Ce numéro de téléphone est déjà enregistré'
      });
    }

    // 3. Créer l'utilisateur
    const user = await User.create({
      full_name,
      phone: formattedPhone,
      email: email || null,
      password_hash: password,
      role
    });

    // 4. Créer le profil spécifique
    if (role === 'validator') {
      await Validator.create({
        user_id: user.id,
        id_card_url: documents.idCard,
        selfie_url: documents.selfie,
        verification_status: 'pending'
      });
    } else if (role === 'partner') {
      await Partner.create({
        user_id: user.id,
        business_name: documents.businessName,
        owner_name: full_name,
        address: documents.address,
        payment_phone: documents.paymentPhone || formattedPhone,
        payment_operator: phoneValidation.operator,
        commerce_registry_url: documents.commerceRegistry,
        verification_status: 'pending'
      });
    }

    // 5. Envoyer le code de vérification par SMS (RÉEL)
    const { code } = await smsService.sendVerificationCode(formattedPhone, 'ar');

    // 6. Sauvegarder le code en base
    await VerificationCode.create({
      phone: formattedPhone,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // 7. Message de bienvenue
    await smsService.sendWelcomeMessage(formattedPhone, role);

    // 8. Générer le token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        phone: user.phone
      },
      Environment.get('JWT_SECRET'),
      { expiresIn: Environment.get('JWT_EXPIRE') }
    );

    res.status(201).json({
      message: 'Inscription réussie. Code de vérification envoyé par SMS.',
      token,
      user: user.toJSON(),
      requiresVerification: true
    });

  } catch (error) {
    next(error);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    const formattedPhone = validateMauritaniaPhone(phone).formatted;

    // 1. Chercher le code en base
    const verificationCode = await VerificationCode.findOne({
      where: {
        phone: formattedPhone,
        used_at: null,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    if (!verificationCode) {
      return res.status(400).json({
        error: 'Code invalide ou expiré'
      });
    }

    // 2. Vérifier les tentatives
    if (verificationCode.attempts >= 3) {
      await verificationCode.update({ used_at: new Date() });
      return res.status(429).json({
        error: 'Trop de tentatives. Veuillez redemander un code.'
      });
    }

    // 3. Incrémenter les tentatives
    await verificationCode.increment('attempts');

    // 4. Vérifier le code
    if (verificationCode.code !== code) {
      return res.status(400).json({
        error: 'Code incorrect',
        attemptsLeft: 3 - verificationCode.attempts
      });
    }

    // 5. Code correct, vérifier le téléphone
    const user = await User.findOne({ where: { phone: formattedPhone } });

    await user.update({
      is_phone_verified: true,
      phone_verified_at: new Date()
    });

    // 6. Marquer le code comme utilisé
    await verificationCode.update({ used_at: new Date() });

    res.json({
      message: 'Téléphone vérifié avec succès',
      user: user.toJSON()
    });

  } catch (error) {
    next(error);
  }
};

export const resendCode = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const formattedPhone = validateMauritaniaPhone(phone).formatted;

    // 1. Vérifier que l'utilisateur existe
    const user = await User.findOne({ where: { phone: formattedPhone } });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    if (user.is_phone_verified) {
      return res.status(400).json({
        error: 'Téléphone déjà vérifié'
      });
    }

    // 2. Générer et envoyer un nouveau code
    const { code } = await smsService.sendVerificationCode(formattedPhone, 'ar');

    // 3. Sauvegarder le nouveau code
    await VerificationCode.create({
      phone: formattedPhone,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    res.json({
      message: 'Nouveau code envoyé par SMS'
    });

  } catch (error) {
    next(error);
  }
};