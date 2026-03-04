import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VerificationCode = sequelize.define('VerificationCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'verification_codes',
  timestamps: true,
  underscored: true
});

export default VerificationCode;