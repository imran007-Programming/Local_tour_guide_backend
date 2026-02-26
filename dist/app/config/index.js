"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    salt: process.env.SALT,
    Cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    Cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    Cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
    Stripe_Secret_key: process.env.STRIPE_SECRET_KEY,
    Stripe_Secret_webhook: process.env.STRIPE_SECRET_WEBHOOK,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL
};
