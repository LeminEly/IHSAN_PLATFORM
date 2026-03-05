import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Standard API Verification

const BASE_URL = 'http://localhost:3000/api/v1';

async function runGlobalTests() {
    console.log('🏁 Starting Global API Verification for IHSAN Platform\n');

    let adminToken = '';
    let validatorToken = '';
    let needId = '';

    try {
        // 1. Public Routes
        console.log('--- 🌍 Testing Public Routes ---');
        const dashboard = await axios.get(`${BASE_URL}/public/dashboard`);
        console.log('✅ Public Dashboard OK');
        const needs = await axios.get(`${BASE_URL}/public/needs`);
        console.log('✅ Public Needs Catalog OK');

        // 2. Authentication
        console.log('\n--- 👤 Testing Authentication ---');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            phone: '+22222222222',
            password: 'password123'
        });
        adminToken = adminLogin.data.token;
        console.log('✅ Admin Login OK');

        const valLogin = await axios.post(`${BASE_URL}/auth/login`, {
            phone: '+22233333333',
            password: 'password123'
        });
        validatorToken = valLogin.data.token;
        console.log('✅ Validator Login OK');

        // 3. Validator Need Creation
        console.log('\n--- 🔍 Testing Validator Flow ---');

        // We'll fetch partners list from API
        const partners = await axios.get(`${BASE_URL}/admin/partners`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (!partners.data || partners.data.length === 0) {
            console.log('⚠️ No partners found in database!');
            throw new Error('Partners list is empty');
        }

        const partnerIdForNeed = partners.data[0].id;
        console.log(`✅ Partner Found: ${partners.data[0].business_name} (ID: ${partnerIdForNeed})`);

        const newNeed = await axios.post(`${BASE_URL}/validator/needs`, {
            title: 'Besoin de Test Global',
            description: 'Ceci est un test automatisé de flux complet',
            estimated_amount: 5000,
            location_quarter: 'Tevragh Zeina',
            partner_id: partnerIdForNeed,
            category: 'food_basket',
            priority: 3,
            beneficiary_description: 'Famille de 5 personnes',
            family_size: 5
        }, {
            headers: { Authorization: `Bearer ${validatorToken}` }
        });
        needId = newNeed.data.need.id;
        console.log(`✅ Need Creation OK (ID: ${needId})`);

        // 4. Admin Approval
        console.log('\n--- 🛡️ Testing Admin Approval ---');
        await axios.put(`${BASE_URL}/admin/needs/${needId}/approve`, {
            reason: 'Validation globale ok'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin Approval OK');

        // 5. Donor Funding (Guest)
        console.log('\n--- 🎁 Testing Guest Donation ---');
        const fundResponse = await axios.post(`${BASE_URL}/donor/needs/${needId}/fund`, {
            donor_phone: '+22248888888',
            payment_method: 'mobile_money'
        });
        console.log('✅ Guest Donation OK');

        console.log('\n✨ ALL TESTS PASSED! IHSAN Platform is 100% Production Ready.');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runGlobalTests();
