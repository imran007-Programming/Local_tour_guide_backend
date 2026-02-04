import express from 'express';
import { authController } from './auth.controller';
import { fileUploader } from '../../helper/fileUploader';
import { createUSerZodSchema } from './auth.validation';
import validateRequest from '../../middleware/validateRequest';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
const router = express.Router();
router.get("/me", authHelper(Role.ADMIN, Role.GUIDE, Role.TOURIST), authController.getMe)
router.post("/register", fileUploader.upload.single("file"), validateRequest(createUSerZodSchema), authController.createUser)
router.post("/login", authController.login)



export const AuthRoutes = router;
