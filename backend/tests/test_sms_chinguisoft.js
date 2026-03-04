import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const validationKey = process.env.CHINGUIS_VALIDATION_KEY;
const token = process.env.CHINGUIS_VALIDATION_TOKEN;
const url = `https://chinguisoft.com/api/sms/validation/${validationKey}`;

async function testChinguisoft(phone, lang = 'fr') {
    console.log(`\n🧪 Testing Chinguisoft SMS (${lang.toUpperCase()})...`);
    console.log(`Target: ${phone}`);

    try {
        const response = await axios.post(url, {
            phone: phone,
            lang: lang
        }, {
            headers: {
                'Validation-token': token,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Success!');
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('❌ Error response:', error.response.data);
        } else {
            console.error('❌ Request failed:', error.message);
        }
        return null;
    }
}

async function runTests() {
    if (!validationKey || !token) {
        console.error('❌ Missing CHINGUIS_VALIDATION_KEY or CHINGUIS_VALIDATION_TOKEN in .env');
        process.exit(1);
    }

    const testPhone = '44800028'; // Replace with a real number for real test

    console.log('🚀 Starting Chinguisoft SMS tests...');

    await testChinguisoft(testPhone, 'fr');
    await testChinguisoft(testPhone, 'ar');

    console.log('\n✨ Tests completed.');
}

runTests();
