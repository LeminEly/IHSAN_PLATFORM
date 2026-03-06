import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Beneficiary = sequelize.define(
  'Beneficiary',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reference_code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    registered_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    description: {
      type: DataTypes.TEXT,
    },
    family_size: {
      type: DataTypes.INTEGER,
    },
    location_quarter: {
      type: DataTypes.STRING,
    },
    location_lat: {
      type: DataTypes.DECIMAL,
    },
    location_lng: {
      type: DataTypes.DECIMAL,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'beneficiaries',
    timestamps: true,
    underscored: true,
  },
);

export default Beneficiary;
