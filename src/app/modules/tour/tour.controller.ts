import httpStatus from 'http-status';
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { tourService } from "./tour.service";
import pick from "../../helper/Pick";
import { tourFilterableFields } from "./tour.constant";
import ApiError from "../../error/ApiError";

const createTour = catchAsync(async (req: Request, res: Response) => {

    const result = await tourService.createTour(req);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tour created successfully",
        data: result,
    })

})
const getAllTourFromDb = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder", "maxPrice", "minPrice"])
    const filters = pick(req.query, tourFilterableFields)
    const result = await tourService.getAllTour(options, filters);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour Retrived successfully",
        meta: result.meta,
        data: result.data,
    })

})
const getSingleTour = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const result = await tourService.getSingleTour(slug);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour retrieved successfully",
        data: result,
    })

})


const updateTour = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const tourId = req.params.tourId as string
    const payload = req.body


    const result = await tourService.updateTour(tourId, payload)
    sendResponse(res, {
        statusCode: 201,
        message: "tour updated successfully",
        success: true,
        data: result
    })
})



const deleteTour = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const tourId = req.params.tourId as string

    const result = await tourService.deleteTour(tourId)
    sendResponse(res, {
        statusCode: 201,
        message: "tour deleted successfully",
        success: true,
        data: result
    })
})

const addTourImages = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;

        if (!req.files || !Array.isArray(req.files)) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "No images uploaded"
            );
        }

        const result = await tourService.addTourImages(
            id,
            req
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Images added successfully",
            data: result
        })
    }
);

const deleteTourImage = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Image URL is required"
            );
        }

        const result = await tourService.deleteTourImage(
            id,
            imageUrl
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Image deleted successfully",
            data: result
        })
    }
);



export const tourController = {
    createTour,
    getAllTourFromDb,
    getSingleTour,
    updateTour,
    deleteTour,
    addTourImages,
    deleteTourImage
}