import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    salt: process.env.SALT,
    Cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    Cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    Cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
    Stripe_Secret_key: process.env.STRIPE_SECRET_KEY,
    Stripe_Secret_webhook: process.env.STRIPE_SECRET_WEBHOOK,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    FRONTEND_URL: process.env.FRONTEND_URL

};
