import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Partner = sequelize.define(
  'Partner',
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
    business_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location_lat: {
      type: DataTypes.DECIMAL,
    },
    location_lng: {
      type: DataTypes.DECIMAL,
    },
    payment_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_operator: {
      type: DataTypes.ENUM('bankily', 'masrivie', 'sedad', 'other'),
    },
    payment_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    payment_verified_at: {
      type: DataTypes.DATE,
    },
    commerce_registry_url: {
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
    site_visit_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    site_visit_date: {
      type: DataTypes.DATE,
    },
    site_visit_notes: {
      type: DataTypes.TEXT,
    },
    site_visit_photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    visited_by: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'partners',
    timestamps: true,
    underscored: true,
  },
);

export default Partner;
