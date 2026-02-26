import httpStatus from 'http-status';
import { NextFunction, Request, Response } from "express"
import ApiError from "../error/ApiError"
import { jwtHelper } from '../helper/tokenGenarator';
import { Role } from '@prisma/client';
import config from '../config';
import jwt from "jsonwebtoken";

const authHelper = (...roles: string[]) => {
    return async (
        req: Request & { user?: any },
        res: Response,
        next: NextFunction
    ) => {
        try {
            const accessToken = req.cookies["accessToken"];
            const refreshToken = req.cookies["refreshToken"];

            //  If no refresh token → user fully unauthorized
            if (!refreshToken) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Please login again",
                });
            }

            let decodedUser: any = null;

            //  Try verifying access token if exists
            if (accessToken) {
                try {
                    decodedUser = jwt.verify(
                        accessToken,
                        config.ACCESS_TOKEN_SECRET
                    );
                } catch (error: any) {

                    decodedUser = null;
                }
            }


            //  If access token invalid or missing → use refresh token
            if (!decodedUser) {
                try {
                    const decodedRefresh = jwt.verify(
                        refreshToken,
                        config.REFRESH_TOKEN_SECRET
                    ) as any;

                    //  Generate new access token
                    const newAccessToken = jwt.sign(
                        {
                            userId: decodedRefresh.userId,
                            role: decodedRefresh.role,
                        },
                        config.ACCESS_TOKEN_SECRET,
                        { expiresIn: "15m" }
                    );

                    //  Set new cookie
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: 15 * 60 * 1000,
                    });

                    decodedUser = decodedRefresh;
                } catch {
                    return res.status(httpStatus.UNAUTHORIZED).json({
                        success: false,
                        message: "Session expired. Please login again.",
                    });
                }
            }

            req.user = decodedUser;

            //  Role checking
            if (roles.length && !roles.includes(decodedUser.role)) {
                return res.status(httpStatus.FORBIDDEN).json({
                    success: false,
                    message: "Forbidden",
                });
            }

            next();
        } catch {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
        }
    };
};

export default authHelper;


