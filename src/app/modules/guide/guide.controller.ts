import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { guideService } from "./guide.service";
import sendResponse from "../../shared/sendResponse";


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await guideService.getAllFromDB(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Guides retrieved successfully",
        data: result,
    });
});


const getSingleFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await guideService.getSingleFromDB(String(id));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Guide retrieved successfully",
        data: result,
    });
});

const updateSingleFromDB = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId
    const payload = req.body

    const result = await guideService.updateSingleFromDB(userId, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Guide retrieved successfully",
        data: result,
    });
});




export const guideController = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};