import express, { NextFunction, Request, Response } from 'express';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import { tourController } from './tour.controller';
import validateRequest from '../../middleware/validateRequest';
import { createTourZodSchema, updateTourZodSchema } from './tour.validation';
import { fileUploader } from '../../helper/fileUploader';
const router = express.Router();

router.get("/", tourController.getAllTourFromDb)

router.post("/",
    authHelper(Role.GUIDE),
    fileUploader.upload.array("files"),
    validateRequest(createTourZodSchema),
    tourController.createTour)

router.patch("/:tourId",
    authHelper(Role.GUIDE),
    fileUploader.upload.array("files"),
    validateRequest(updateTourZodSchema),
    tourController.updateTour)

router.delete("/:tourId",
    authHelper(Role.GUIDE),
    tourController.deleteTour)

export const tourRoutes = router;