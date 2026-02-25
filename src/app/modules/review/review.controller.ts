import httpStatus from 'http-status';
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { reviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!
    const payload = req.body
    const result = await reviewService.createReview(user, payload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Review added successfully",
        data: result
    })
})

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.getAllReviews()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieved successfully",
        data: result
    })
})

const getTourReviews = catchAsync(async (req: Request, res: Response) => {
    const tourId = req.params.tourId as string
    const result = await reviewService.getTourReviews(tourId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour reviews retrieved successfully",
        data: result
    })
})

const getGuideReviews = catchAsync(async (req: Request, res: Response) => {
    const guideId = req.params.guideId as string
    const result = await reviewService.getGuideReviews(guideId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide reviews retrieved successfully",
        data: result
    })
})

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!
    const result = await reviewService.getMyReviews(user)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My reviews retrieved successfully",
        data: result
    })
})

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!
    const id = req.params.id as string
    const payload = req.body
    const result = await reviewService.updateReview(user, id, payload)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review updated successfully",
        data: result
    })
})

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!
    const id = req.params.id as string
    const result = await reviewService.deleteReview(user, id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review deleted successfully",
        data: result
    })
})



export const reviewController = {
    createReview,
    getAllReviews,
    getTourReviews,
    getGuideReviews,
    getMyReviews,
    updateReview,
    deleteReview
}