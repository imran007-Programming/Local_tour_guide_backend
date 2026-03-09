import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync"
import sendResponse from '../../shared/sendResponse';
import { authService } from './auth.service';
import ApiError from "../../error/ApiError";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { jwtHelper } from "../../helper/tokenGenarator";
import config from "../../config";
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
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
        path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 90 * 24 * 60 * 60 * 1000,
        path: "/",
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "user login successfully",
        data: result
    })
})

const logout = catchAsync(async (req: Request, res: Response) => {

    res.clearCookie("accessToken", {
        secure: true,
        httpOnly: true,
        sameSite: "none",

    })
    res.clearCookie("refreshToken", {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    })
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "logout successfully",
        data: null
    })

})

// Genarate Refresh Token
const getRefreshToken = catchAsync(async (req: Request, res: Response) => {
    try {
        // Check cookies first, then body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            config.REFRESH_TOKEN_SECRET
        ) as JwtPayload;

        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
                role: decoded.role,
            },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: config.ACCESS_TOKEN_EXPIRE || "15m" } as SignOptions
        );

        // Set new access token in cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: "/",
        });

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "accessToken get successfully",
            data: accessToken
        })

    } catch {
        return res.status(401).json({
            success: false,
            message: "Refresh token expired",
        });
    }

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
    getRefreshToken,
    logout

}