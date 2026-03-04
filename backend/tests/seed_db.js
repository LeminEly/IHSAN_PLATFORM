import sequelize from '../src/config/database.js';
import User from '../src/models/User.js';
import Validator from '../src/models/Validator.js';
import Partner from '../src/models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

// Critical for Supabase SSL in some environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function seed() {
    try {
        console.log('⏳ Syncing database models...');
        // We use alter: true to update schema without dropping if possible
        await sequelize.sync({ alter: true });
        console.log('✅ Models synced.');

        const rawPassword = 'password123';

        // 1. Create Admin
        const [adminUser, createdAdmin] = await User.findOrCreate({
            where: { phone: '+22222222222' },
            defaults: {
                full_name: 'Super Admin',
                password_hash: rawPassword, // Will be hashed by beforeCreate hook
                role: 'admin',
                is_active: true,
                is_phone_verified: true
            }
        });

        if (createdAdmin) {
            console.log('✅ Admin user created (22222222)');
        } else {
            console.log('ℹ️ Admin user already exists');
        }

        // 2. Create Validator
        const [valUser] = await User.findOrCreate({
            where: { phone: '+22233333333' },
            defaults: {
                full_name: 'Test Validator',
                password_hash: rawPassword,
                role: 'validator',
                is_active: true,
                is_phone_verified: true
            }
        });

        await Validator.findOrCreate({
            where: { user_id: valUser.id },
            defaults: {
                verification_status: 'approved',
                location_quarter: 'Arafat',
                payment_phone: '+22233333333',
                id_card_url: 'https://res.cloudinary.com/demo/image/upload/id_card.jpg',
                selfie_url: 'https://res.cloudinary.com/demo/image/upload/selfie.jpg'
            }
        });
        console.log('✅ Validator user and profile ready (+22233333333)');

        // 3. Create Partner
        const [partnerUser] = await User.findOrCreate({
            where: { phone: '+22244444444' },
            defaults: {
                full_name: 'Boutique Mauritanie',
                password_hash: rawPassword,
                role: 'partner',
                is_active: true,
                is_phone_verified: true
            }
        });

        await Partner.findOrCreate({
            where: { user_id: partnerUser.id },
            defaults: {
                business_name: 'Boutique Mauritanie',
                owner_name: 'Ahmed Mauritanie',
                verification_status: 'approved',
                payment_phone: '+22244444444',
                address: 'Carrefour Madrid',
                commerce_registry_url: 'https://res.cloudinary.com/demo/image/upload/registry.jpg'
            }
        });
        console.log('✅ Partner user and profile ready (+22244444444)');

        console.log('\n✨ Seeding completed successfully!');
        await sequelize.close();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
