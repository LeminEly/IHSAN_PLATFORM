import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  need_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'needs', key: 'id' }
  },
  donor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  partner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'partners', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('mobile_money', 'card', 'cash')
  },
  donor_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  partner_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payment_reference: {
    type: DataTypes.STRING
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  payment_completed_at: {
    type: DataTypes.DATE
  },
  receipt_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  receipt_url: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'confirmed', 'failed'),
    defaultValue: 'pending'
  },
  blockchain_hash: {
    type: DataTypes.STRING
  },
  blockchain_tx_hash: {
    type: DataTypes.STRING
  },
  blockchain_explorer_url: {
    type: DataTypes.TEXT
  },
  blockchain_timestamp: {
    type: DataTypes.DATE
  },
  blockchain_id: {
    type: DataTypes.INTEGER
  },
  confirmed_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  confirmed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true
});

export default Transaction;