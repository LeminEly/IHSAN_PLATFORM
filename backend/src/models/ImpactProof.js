import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ImpactProof = sequelize.define('ImpactProof', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'transactions', key: 'id' }
  },
  proof_type: {
    type: DataTypes.ENUM('photo', 'confirmation_code'),
    allowNull: false
  },
  media_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.TEXT
  },
  is_faces_blurred: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'impact_proofs',
  timestamps: true,
  underscored: true
});

export default ImpactProof;