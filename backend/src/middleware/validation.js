import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status(400).json({
      error: 'Données invalides',
      details: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  };
};

export const registerValidator = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Nom complet requis'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Numéro de téléphone requis')
    .matches(/^\+?[0-9\s\-]{8,15}$/).withMessage('Numéro de téléphone invalide'),
  body('password')
    .notEmpty().withMessage('Mot de passe requis')
    .isLength({ min: 6 }).withMessage('Mot de passe trop court (6 caractères minimum)'),
  body('role')
    .trim()
    .notEmpty().withMessage('Rôle requis')
    .isIn(['donor', 'validator', 'partner', 'admin']).withMessage('Rôle invalide'),
];

export const loginValidator = [
  body('phone').trim().notEmpty().withMessage('Téléphone requis'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

export const needValidator = [
  body('title').trim().notEmpty().withMessage('Titre requis'),
  body('estimated_amount').isFloat({ min: 1 }).withMessage('Montant invalide')
];

export const verifyPhoneValidator = [
  body('phone').trim().notEmpty().withMessage('Téléphone requis'),
  body('code').isLength({ min: 4, max: 6 }).withMessage('Code invalide')
];