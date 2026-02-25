import express, { NextFunction, Request, Response } from 'express';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';
import { tourController } from './tour.controller';
import validateRequest from '../../middleware/validateRequest';
import { createTourZodSchema, updateTourZodSchema } from './tour.validation';
import { fileUploader } from '../../helper/fileUploader';
const router = express.Router();

router.get("/categories", tourController.getCategories)
router.get("/", tourController.getAllTourFromDb)
router.get("/:slug", tourController.getSingleTour)

router.post("/create-tour",
    authHelper(Role.GUIDE),
    fileUploader.upload.array("images"),
    validateRequest(createTourZodSchema),
    tourController.createTour)

router.put("/:tourId",
    authHelper(Role.GUIDE, Role.ADMIN),
    fileUploader.upload.array("images"),
    validateRequest(updateTourZodSchema),
    tourController.updateTour)

router.delete("/:tourId",
    authHelper(Role.GUIDE),
    tourController.deleteTour)

router.post(
    "/:id/images",
    authHelper(Role.ADMIN, Role.GUIDE),
    fileUploader.upload.array("images"),
    tourController.addTourImages
);

router.delete(
    "/:id/images",
    authHelper(Role.ADMIN, Role.GUIDE),
    tourController.deleteTourImage
);

export const tourRoutes = router;