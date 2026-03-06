import Validator from '../models/Validator.js';

export const requireVerifiedValidator = async (req, res, next) => {
  try {
    const validator = await Validator.findOne({
      where: { user_id: req.user.id },
    });

    if (!validator) {
      return res.status(403).json({ error: 'Profil validateur non trouvé' });
    }

    if (validator.verification_status !== 'approved') {
      return res.status(403).json({
        error: "Votre compte validateur n'est pas encore approuvé",
        status: validator.verification_status,
      });
    }

    req.validator = validator;
    next();
  } catch (error) {
    console.error('requireVerifiedValidator error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
