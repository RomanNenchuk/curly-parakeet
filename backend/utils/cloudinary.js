import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });

const { CLOUD_NAME, CLOUD_KEY, CLOUD_KEY_SECRET } = process.env;

// Конфігурація Cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_KEY_SECRET,
});

export default cloudinary;
