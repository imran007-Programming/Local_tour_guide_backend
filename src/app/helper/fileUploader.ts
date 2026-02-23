import httpStatus from "http-status";
import multer from "multer";
import path from "path";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "../config";
import ApiError from "../error/ApiError";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

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

    try {
        const uploadResult = await cloudinary.uploader.upload(
            file.path,
            {
                public_id: file.filename,
            }
        );
        return uploadResult;
    } catch (error) {
        console.log(error);
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Image upload failed"
        );
    }
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