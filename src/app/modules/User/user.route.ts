import express from 'express';
import { userController } from './user.controller';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import validateRequest from '../../middleware/validateRequest';
import { updateUserZodSchema } from './user.validation';
import { fileUploader } from '../../helper/fileUploader';

const router = express.Router()

router.get("/", authHelper(Role.ADMIN), userController.getAllfromDB)
router.get("/:id", authHelper(Role.ADMIN), userController.getSingleUserfromDB)
router.patch("/update-profile",
    authHelper(Role.ADMIN, Role.GUIDE, Role.TOURIST),
    fileUploader.upload.single("profilePic"),
    validateRequest(updateUserZodSchema),
    userController.updateUser)
export const userRoutes = router