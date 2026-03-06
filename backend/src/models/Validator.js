import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Validator = sequelize.define(
  'Validator',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
    id_card_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    selfie_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    verification_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
      defaultValue: 'pending',
    },
    verified_by: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' },
    },
    verified_at: {
      type: DataTypes.DATE,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
    },
    reputation_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_deliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    success_rate: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    working_quarters: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
  },
  {
    tableName: 'validators',
    timestamps: true,
    underscored: true,
  },
);

export default Validator;
