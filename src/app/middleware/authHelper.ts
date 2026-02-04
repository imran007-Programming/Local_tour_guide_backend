import httpStatus from 'http-status';
import { NextFunction, Request, Response } from "express"
import ApiError from "../error/ApiError"
import { jwtHelper } from '../helper/tokenGenarator';
import { Role } from '@prisma/client';

const authHelper = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies["accessToken"]
            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
            }
            const verifyUser = await jwtHelper.verifyToken(token, "abc")

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