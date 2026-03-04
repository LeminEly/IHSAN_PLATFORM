import User from './User.js';
import Validator from './Validator.js';
import Partner from './Partner.js';
import Beneficiary from './Beneficiary.js';
import Need from './Need.js';
import Transaction from './Transaction.js';
import ImpactProof from './ImpactProof.js';
import Notification from './Notification.js';
import AdminAction from './AdminAction.js';
import VerificationCode from './VerificationCode.js';

const setupAssociations = () => {
    // ─── User ↔ Profiles ─────────────────────────────────────────────────────────
    User.hasOne(Validator, { foreignKey: 'user_id', as: 'validator' });
    Validator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    User.hasOne(Partner, { foreignKey: 'user_id', as: 'partner_profile' });
    Partner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // ─── Need ↔ Actors ───────────────────────────────────────────────────────────
    Need.belongsTo(User, { foreignKey: 'validator_id', as: 'validator' });
    User.hasMany(Need, { foreignKey: 'validator_id', as: 'validated_needs' });

    Need.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' });
    Partner.hasMany(Need, { foreignKey: 'partner_id', as: 'needs' });

    Need.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
    Beneficiary.hasMany(Need, { foreignKey: 'beneficiary_id', as: 'needs' });

    // ─── Transaction ↔ Actors & Objects ──────────────────────────────────────────
    Transaction.belongsTo(Need, { foreignKey: 'need_id', as: 'need' });
    Need.hasOne(Transaction, { foreignKey: 'need_id', as: 'transaction' });

    Transaction.belongsTo(User, { foreignKey: 'donor_id', as: 'donor' });
    User.hasMany(Transaction, { foreignKey: 'donor_id', as: 'donations' });

    Transaction.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' });
    Partner.hasMany(Transaction, { foreignKey: 'partner_id', as: 'transactions' });

    Transaction.belongsTo(User, { foreignKey: 'confirmed_by', as: 'confirming_validator' });

    // ─── ImpactProof ↔ Transaction & User ────────────────────────────────────────
    ImpactProof.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
    Transaction.hasOne(ImpactProof, { foreignKey: 'transaction_id', as: 'impact_proof' });

    ImpactProof.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

    // ─── Other Models ────────────────────────────────────────────────────────────
    Beneficiary.belongsTo(User, { foreignKey: 'registered_by', as: 'registrar' });

    Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

    AdminAction.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });
    AdminAction.belongsTo(User, { foreignKey: 'target_user_id', as: 'target_user' });
    AdminAction.belongsTo(Validator, { foreignKey: 'target_validator_id', as: 'target_validator' });
    AdminAction.belongsTo(Partner, { foreignKey: 'target_partner_id', as: 'target_partner' });
    AdminAction.belongsTo(Transaction, { foreignKey: 'target_transaction_id', as: 'target_transaction' });
};

export default setupAssociations;
