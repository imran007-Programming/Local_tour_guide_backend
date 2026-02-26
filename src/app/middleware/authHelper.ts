import httpStatus from 'http-status';
import { NextFunction, Request, Response } from "express"
import ApiError from "../error/ApiError"
import { jwtHelper } from '../helper/tokenGenarator';
import { Role } from '@prisma/client';
import config from '../config';
import jwt from "jsonwebtoken";
const authHelper = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            // Check cookie first, then Authorization header
            let token = req.cookies["accessToken"];

            if (!token) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
            }

            const verifyUser = await jwtHelper.verifyToken(token, config.ACCESS_TOKEN_SECRET)
            req.user = verifyUser

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}



export default authHelper;


