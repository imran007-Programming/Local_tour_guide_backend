import express from 'express';
import { guideController } from './guide.controller';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import validateRequest from '../../middleware/validateRequest';
import { updateGuideZodSchema } from './guide.validation';

const router = express.Router();

router.get("/", guideController.getAllFromDB)
router.get("/:id", guideController.getSingleFromDB);
router.patch("/", authHelper(Role.GUIDE), guideController.updateSingleFromDB);
export const guideRoutes = router;