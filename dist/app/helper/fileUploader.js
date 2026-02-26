"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
const http_status_1 = __importDefault(require("http-status"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../error/ApiError"));
const stream_1 = require("stream");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const configureCloudinary = () => {
    cloudinary_1.v2.config({
        cloud_name: config_1.default.Cloudinary_cloud_name,
        api_key: config_1.default.Cloudinary_api_key,
        api_secret: config_1.default.Cloudinary_api_secret,
    });
};
const uploadToCloudinary = async (file) => {
    configureCloudinary();
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        }, (error, result) => {
            if (error) {
                console.log(error);
                reject(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Image upload failed"));
            }
            else {
                resolve(result);
            }
        });
        stream_1.Readable.from(file.buffer).pipe(uploadStream);
    });
};
const deleteFromCloudinary = async (imageUrl) => {
    configureCloudinary();
    try {
        const urlParts = imageUrl.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const publicId = fileNameWithExtension.split(".")[0];
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.log(error);
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Image delete failed");
    }
};
exports.fileUploader = {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary,
};
