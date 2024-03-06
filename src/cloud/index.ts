import { v2 as cloudinary } from 'cloudinary';

import {
  CLOUDINARY_KEY,
  CLOUDINARY_NAME,
  CLOUDINARY_SECRET,
} from 'utils/variables';

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
  secure: true,
});

export const cloudAPI = cloudinary.api;

export default cloudinary;
