import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { touristService } from "./tourist.service";
import sendResponse from "../../shared/sendResponse";


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await touristService.getAllFromDB(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tourists retrieved successfully",
        data: result,
    });
});


const getSingleFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await touristService.getSingleFromDB(String(id));

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tourist retrieved successfully",
        data: result,
    });
});

const updateSingleFromDB = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId
    const payload = req.body

    const result = await touristService.updateSingleFromDB(userId, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tourist updated successfully",
        data: result,
    });
});




export const touristController = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
