
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync"
import sendResponse from '../../shared/sendResponse';
import { authService } from './auth.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.createUser(req);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: result,
    });
});


const login = catchAsync(async (req: Request, res: Response) => {

    const result = await authService.login(req.body)
    const { accessToken, refreshToken } = result;
    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    });
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 90,
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "user login successfully",
        data: result
    })
})

const getMe = catchAsync(async (req: Request & { user?: any }, res: Response) => {

    const user = req.user
    const result = await authService.getME(user)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "profile Retrived successfully",
        data: result
    })

})




export const authController = {
    createUser,
    login,
    getMe,

}