import User from './User.js';
import Validator from './Validator.js';
import Partner from './Partner.js';
import Beneficiary from './Beneficiary.js';
import Need from './Need.js';
import Transaction from './Transaction.js';
import ImpactProof from './ImpactProof.js';
import AdminAction from './AdminAction.js';
import Notification from './Notification.js';
import VerificationCode from './VerificationCode.js';

// User associations
User.hasOne(Validator, { foreignKey: 'user_id', as: 'validator' });
User.hasOne(Partner, { foreignKey: 'user_id', as: 'partner' });
User.hasMany(Need, { foreignKey: 'validator_id', as: 'needs' });
User.hasMany(Transaction, { foreignKey: 'donor_id', as: 'donations' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(Beneficiary, { foreignKey: 'registered_by', as: 'registeredBeneficiaries' });

// Validator associations
Validator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Partner associations
Partner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Partner.hasMany(Need, { foreignKey: 'partner_id', as: 'needs' });
Partner.hasMany(Transaction, { foreignKey: 'partner_id', as: 'transactions' });

// Beneficiary associations
Beneficiary.belongsTo(User, { foreignKey: 'registered_by', as: 'registeredBy' });
Beneficiary.hasMany(Need, { foreignKey: 'beneficiary_id', as: 'needs' });

// Need associations
Need.belongsTo(User, { foreignKey: 'validator_id', as: 'validator' });
Need.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' });
Need.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
Need.hasOne(Transaction, { foreignKey: 'need_id', as: 'transaction' });

// Transaction associations
Transaction.belongsTo(Need, { foreignKey: 'need_id', as: 'need' });
Transaction.belongsTo(User, { foreignKey: 'donor_id', as: 'donor' });
Transaction.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' });
Transaction.hasOne(ImpactProof, { foreignKey: 'transaction_id', as: 'impact_proof' });

// ImpactProof associations
ImpactProof.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
ImpactProof.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// AdminAction associations
AdminAction.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  User,
  Validator,
  Partner,
  Beneficiary,
  Need,
  Transaction,
  ImpactProof,
  AdminAction,
  Notification,
  VerificationCode,
};
