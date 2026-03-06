import { v2 as cloudinary } from 'cloudinary';
import Environment from './environment.js';

cloudinary.config({
  cloud_name: Environment.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Environment.get('CLOUDINARY_API_KEY'),
  api_secret: Environment.get('CLOUDINARY_API_SECRET'),
});

export default cloudinary;
