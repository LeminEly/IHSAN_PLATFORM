import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Need = sequelize.define('Need', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  validator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  partner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'partners', key: 'id' }
  },
  beneficiary_id: {
    type: DataTypes.UUID,
    references: { model: 'beneficiaries', key: 'id' }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('iftar_meal', 'food_basket', 'clothing', 'medical', 'other')
  },
  estimated_amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  location_quarter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_lat: {
    type: DataTypes.DECIMAL
  },
  location_lng: {
    type: DataTypes.DECIMAL
  },
  status: {
    type: DataTypes.ENUM('pending', 'open', 'funded', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  expiry_date: {
    type: DataTypes.DATE
  },
  funded_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  },
  cancelled_at: {
    type: DataTypes.DATE
  },
  cancellation_reason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'needs',
  timestamps: true,
  underscored: true
});

export default Need;