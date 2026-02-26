import httpStatus from "http-status";
import multer from "multer";
import path from "path";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "../config";
import ApiError from "../error/ApiError";
import { Readable } from "stream";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: config.Cloudinary_cloud_name,
        api_key: config.Cloudinary_api_key,
        api_secret: config.Cloudinary_api_secret,
    });
};

const uploadToCloudinary = async (
    file: Express.Multer.File
): Promise<UploadApiResponse> => {
    configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            },
            (error, result) => {
                if (error) {
                    console.log(error);
                    reject(new ApiError(httpStatus.BAD_REQUEST, "Image upload failed"));
                } else {
                    resolve(result!);
                }
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

const deleteFromCloudinary = async (
    imageUrl: string
): Promise<void> => {
    configureCloudinary();

    try {
        const urlParts = imageUrl.split("/");
        const fileNameWithExtension =
            urlParts[urlParts.length - 1];
        const publicId =
            fileNameWithExtension.split(".")[0];

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error);
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Image delete failed"
        );
    }
};

export const fileUploader = {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary,
};