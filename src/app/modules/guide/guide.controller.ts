import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { guideService } from "./guide.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/Pick";
import { guideFilterableFields } from "./guide.constant";


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
    const filters = pick(req.query, guideFilterableFields)
    const result = await guideService.getAllFromDB(options, filters);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Guides retrieved successfully",
        meta: result.meta,
        data: result.data,
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