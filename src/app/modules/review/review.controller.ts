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



export const reviewController = {
    createReview
}