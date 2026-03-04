import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AdminAction = sequelize.define('AdminAction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  action_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  target_user_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  target_validator_id: {
    type: DataTypes.UUID,
    references: { model: 'validators', key: 'id' }
  },
  target_partner_id: {
    type: DataTypes.UUID,
    references: { model: 'partners', key: 'id' }
  },
  target_transaction_id: {
    type: DataTypes.UUID,
    references: { model: 'transactions', key: 'id' }
  },
  reason: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'admin_actions',
  timestamps: true,
  underscored: true
});

export default AdminAction;