import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

class Environment {
  static validate() {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  static get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  static isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  static isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }
}

export default Environment;