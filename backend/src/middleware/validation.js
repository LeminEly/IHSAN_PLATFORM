import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      error: 'Données invalides',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

export const registerValidator = [
  body('full_name').notEmpty().withMessage('Nom complet requis'),
  body('phone').matches(/^\+?[0-9]{8,15}$/).withMessage('Numéro de téléphone invalide'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe trop court'),
  body('role').isIn(['donor', 'validator', 'partner']).withMessage('Rôle invalide')
];

export const loginValidator = [
  body('phone').notEmpty().withMessage('Téléphone requis'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

export const needValidator = [
  body('title').notEmpty().withMessage('Titre requis'),
  body('estimated_amount').isFloat({ min: 1 }).withMessage('Montant invalide')
];

export const verifyPhoneValidator = [
  body('phone').notEmpty().withMessage('Téléphone requis'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code à 6 chiffres requis')
];