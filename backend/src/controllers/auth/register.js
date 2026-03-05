import User from '../../models/User.js';
import Validator from '../../models/Validator.js';
import Partner from '../../models/Partner.js';
import VerificationCode from '../../models/VerificationCode.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Environment from '../../config/environment.js';
import cloudinary from '../../config/cloudinary.js';
import twilioService from '../../services/sms/twilio.service.js';
import { validateMauritaniaPhone } from '../../utils/validation.js';

// Upload un fichier sur Cloudinary depuis req.files
const uploadToCloudinary = async (file, folder) => {
  if (!file) return null;
  // Si c'est déjà une URL string (test ou mock), retourner directement
  if (typeof file === 'string' && file.startsWith('http')) return file;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `ihsan/${folder}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

export const register = async (req, res, next) => {
  try {
    const { full_name, phone, email, password, role } = req.body;

    // 1. Valider le numéro
    const phoneValidation = validateMauritaniaPhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: phoneValidation.error });
    }
    const formattedPhone = phoneValidation.formatted;

    // 2. Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ where: { phone: formattedPhone } });
    if (existingUser) {
      return res.status(409).json({ error: 'Ce numéro de téléphone est déjà enregistré' });
    }

    // 3. Créer l'utilisateur
    const user = await User.create({
      full_name,
      phone: formattedPhone,
      email: email || null,
      password_hash: password,
      role
    });

    // 4. Créer le profil spécifique selon le rôle
    if (role === 'validator') {
      // Fichiers uploadés via multipart/form-data
      const idCardUrl = await uploadToCloudinary(req.files?.id_card?.[0], 'documents');
      const selfieUrl = await uploadToCloudinary(req.files?.selfie?.[0], 'documents');

      if (!idCardUrl || !selfieUrl) {
        await user.destroy();
        return res.status(400).json({ error: 'Carte d\'identité et selfie requis pour les validateurs' });
      }

      await Validator.create({
        user_id: user.id,
        id_card_url: idCardUrl,
        selfie_url: selfieUrl,
        verification_status: 'pending'
      });

    } else if (role === 'partner') {
      const { business_name, address, payment_phone, payment_operator } = req.body;
      const registryUrl = await uploadToCloudinary(req.files?.commerce_registry?.[0], 'documents');

      if (!registryUrl) {
        await user.destroy();
        return res.status(400).json({ error: 'Registre du commerce requis pour les partenaires' });
      }

      await Partner.create({
        user_id: user.id,
        business_name: business_name || full_name,
        owner_name: full_name,
        address: address || '',
        payment_phone: payment_phone || formattedPhone,
        payment_operator: payment_operator || phoneValidation.operator,
        commerce_registry_url: registryUrl,
        verification_status: 'pending'
      });
    }

    // 5. Envoyer le code de vérification par SMS
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const result = await twilioService.sendVerificationCode(formattedPhone);
      code = result.code || code;
    } catch (smsError) {
      console.error('SMS error (non-blocking):', smsError.message);
      // En dev, on log le code pour tester sans Twilio
      if (Environment.isDevelopment()) {
        console.log(`📱 Code de vérification pour ${formattedPhone}: ${code}`);
      }
    }

    // 6. Sauvegarder le code en base
    await VerificationCode.create({
      phone: formattedPhone,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    // 7. Générer le token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      Environment.get('JWT_SECRET'),
      { expiresIn: Environment.get('JWT_EXPIRE', '7d') }
    );

    res.status(201).json({
      message: 'Inscription réussie. Code de vérification envoyé par SMS.',
      token,
      user: user.toJSON(),
      requiresVerification: true,
      // En dev seulement, retourner le code pour tester
      ...(Environment.isDevelopment() && { debug_code: code })
    });

  } catch (error) {
    next(error);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const formattedPhone = validateMauritaniaPhone(phone).formatted;

    const verificationCode = await VerificationCode.findOne({
      where: {
        phone: formattedPhone,
        used_at: null,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    if (!verificationCode) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    if (verificationCode.attempts >= 5) {
      await verificationCode.update({ used_at: new Date() });
      return res.status(429).json({ error: 'Trop de tentatives. Veuillez redemander un code.' });
    }

    await verificationCode.increment('attempts');

    if (verificationCode.code !== code) {
      return res.status(400).json({
        error: 'Code incorrect',
        attemptsLeft: 5 - (verificationCode.attempts + 1)
      });
    }

    const user = await User.findOne({ where: { phone: formattedPhone } });
    await user.update({ is_phone_verified: true, phone_verified_at: new Date() });
    await verificationCode.update({ used_at: new Date() });

    res.json({ message: 'Téléphone vérifié avec succès', user: user.toJSON() });

  } catch (error) {
    next(error);
  }
};

export const resendCode = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const formattedPhone = validateMauritaniaPhone(phone).formatted;

    const user = await User.findOne({ where: { phone: formattedPhone } });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (user.is_phone_verified) return res.status(400).json({ error: 'Téléphone déjà vérifié' });

    let code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const result = await twilioService.sendVerificationCode(formattedPhone);
      code = result.code || code;
    } catch (e) {
      if (Environment.isDevelopment()) console.log(`📱 Nouveau code pour ${formattedPhone}: ${code}`);
    }

    await VerificationCode.create({
      phone: formattedPhone,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });

    res.json({
      message: 'Nouveau code envoyé par SMS',
      ...(Environment.isDevelopment() && { debug_code: code })
    });

  } catch (error) {
    next(error);
  }
};