import { catchAsync } from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { userService } from './user.service';
import { authService } from '../Auth/auth.service';
import { Request, Response } from 'express';
import { updateUserZodSchema } from './user.validation';
import pick from "../../helper/Pick";
import { userFilterableFields } from "./user.constant";


const getAllfromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
    const filters = pick(req.query, userFilterableFields)
    const result = await userService.getAllfromDB(options, filters)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "user retrived Successfully",
        data: result
    })
})

const getSingleUserfromDB = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string

    const result = await userService.getSingleUserfromDB(id)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "user retrived Successfully",
        data: result
    })
})

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.updateUser(req)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "profile updated successfully",
        data: result
    })

})

const removeProfilePic = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId;
    const result = await userService.removeProfilePic(userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Profile picture removed successfully",
        data: result
    })
})

const deleteAccount = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.userId;
    await userService.deleteAccount(userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Account deleted successfully",
        data: null
    })
})

export const userController = {

    getAllfromDB,
    getSingleUserfromDB,
    updateUser,
    removeProfilePic,
    deleteAccount
}