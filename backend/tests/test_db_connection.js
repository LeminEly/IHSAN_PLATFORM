import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
}

console.log('🔗 Attempting to connect to:', dbUrl.split('@')[1]); // Log host only for security

const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Success! Database connection established.');
        await sequelize.close();
    } catch (error) {
        console.error('❌ Failed to connect to the database:', error.message);
        process.exit(1);
    }
}

testConnection();
