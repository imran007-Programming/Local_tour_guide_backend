import httpStatus from 'http-status';
import multer from "multer"
import path from "path"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import config from "../config"
import ApiError from "../error/ApiError"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "/uploads"))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

const uploadToCloudinary = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
    cloudinary.config({
        cloud_name: config.Cloudinary_cloud_name,
        api_key: config.Cloudinary_api_key,
        api_secret: config.Cloudinary_api_secret,
    })
    ///upload the image
    try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
            public_id: file.filename

        })
        return uploadResult;
    } catch (error) {
        console.log(error);
        throw new ApiError(httpStatus.BAD_REQUEST, "Image upload failed");
    }


}
export const fileUploader = {
    upload,
    uploadToCloudinary,
};
