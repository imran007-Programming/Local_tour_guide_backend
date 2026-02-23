import express from 'express';
import { touristController } from './tourist.controller';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';

const router = express.Router();

router.get("/", touristController.getAllFromDB)
router.get("/:id", touristController.getSingleFromDB);
router.patch("/", authHelper(Role.TOURIST), touristController.updateSingleFromDB);

export const touristRoutes = router;
