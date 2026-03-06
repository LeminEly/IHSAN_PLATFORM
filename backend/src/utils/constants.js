export const ROLES = {
  ADMIN: 'admin',
  VALIDATOR: 'validator',
  PARTNER: 'partner',
  DONOR: 'donor',
};

export const NEED_STATUS = {
  PENDING: 'pending',
  OPEN: 'open',
  FUNDED: 'funded',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

export const PAYMENT_OPERATORS = {
  BANKILY: 'bankily',
  MASRIVIE: 'masrivie',
  SEDAD: 'sedad',
  OTHER: 'other',
};

export const SMS_TEMPLATES = {
  VERIFICATION: '🔐 IHSAN: Votre code de vérification est {code}. Valable 10 minutes.',
  WELCOME_DONOR:
    '🙏 IHSAN: Merci de rejoindre IHSAN ! Vous pouvez maintenant explorer les besoins.',
  WELCOME_VALIDATOR:
    '🤝 IHSAN: Bienvenue ! Votre demande de validateur est en cours de vérification.',
  WELCOME_PARTNER:
    '🏪 IHSAN: Bienvenue ! Votre demande de partenariat est en cours de vérification.',
  ACCOUNT_APPROVED: '✅ IHSAN: Félicitations ! Votre compte {role} a été approuvé.',
  ACCOUNT_REJECTED: '❌ IHSAN: Votre demande de compte {role} a été refusée. Raison: {reason}',
  NEW_NEED: '🍽 IHSAN: Nouveau besoin créé: {title} - {amount} MRU - Quartier {quarter}',
  DONATION_MADE:
    '✅ IHSAN: Un don de {amount} MRU pour "{title}" a été effectué. Veuillez confirmer la remise.',
  PAYMENT_RECEIVED:
    '💰 IHSAN: Paiement reçu de {amount} MRU pour "{title}". Vérifiez votre compte mobile money.',
  DELIVERY_CONFIRMED: '🎉 IHSAN: Votre don pour "{title}" a été remis ! Reçu: {receipt}',
  REMINDER: '⏰ IHSAN: Vous avez {count} livraison(s) en attente de confirmation.',
  SUSPENDED: '⚠️ IHSAN: Votre compte a été suspendu. Raison: {reason}',
};
