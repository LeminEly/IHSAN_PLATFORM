import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
    console.log('☁️ Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    try {
        // Attempt a simple operation: list folders or upload a test pixel
        const result = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
            folder: 'ihsan/test',
            public_id: 'test_pixel'
        });

        console.log('✅ Success! Cloudinary is configured correctly.');
        console.log('Test Image URL:', result.secure_url);

        // Clean up
        await cloudinary.uploader.destroy(result.public_id);
        console.log('🗑️ Test pixel deleted.');
    } catch (error) {
        console.error('❌ Cloudinary Error:', error.message);
        process.exit(1);
    }
}

testCloudinary();
