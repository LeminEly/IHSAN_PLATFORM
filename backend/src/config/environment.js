import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'CHINGUIS_VALIDATION_KEY',
  'CHINGUIS_VALIDATION_TOKEN',
  'SMS_APP_NAME'
];

const dbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

class Environment {
  static validate() {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    // Check for either DATABASE_URL or the full set of DB variables
    if (!process.env.DATABASE_URL) {
      const missingDb = dbVars.filter(v => !process.env[v]);
      if (missingDb.length > 0) {
        missing.push(...missingDb);
      }
    }

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