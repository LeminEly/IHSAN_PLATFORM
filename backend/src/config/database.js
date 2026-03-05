import { Sequelize } from 'sequelize';
import Environment from './environment.js';

// Database configuration handled via Environment utility

const dbUrlRaw = Environment.get('DATABASE_URL');
const dbUrl = dbUrlRaw ? dbUrlRaw.split('?')[0] : null;

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: Environment.isDevelopment() ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase self-signed certs
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  })
  : new Sequelize(
    Environment.get('DB_NAME'),
    Environment.get('DB_USER'),
    Environment.get('DB_PASSWORD'),
    {
      host: Environment.get('DB_HOST'),
      port: Environment.get('DB_PORT'),
      dialect: 'postgres',
      logging: Environment.isDevelopment() ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;