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
            
            // If no access token or expired, try to refresh
            if (!token || isTokenExpired(token)) {
                const refreshToken = req.cookies["refreshToken"];
                
                if (refreshToken) {
                    try {
                        const verifyRefresh = await jwtHelper.verifyToken(refreshToken, config.REFRESH_TOKEN_SECRET);
                        
                        // Generate new access token
                        const newAccessToken = jwtHelper.genarateToken(
                            { userId: verifyRefresh.userId, role: verifyRefresh.role },
                            config.ACCESS_TOKEN_SECRET,
                            config.ACCESS_TOKEN_EXPIRE
                        );
                        
                        // Set new access token in cookie
                        res.cookie("accessToken", newAccessToken, {
                            httpOnly: true,
                            secure: config.node_env === "production",
                            sameSite: "lax",
                            maxAge: 10 * 1000 // 10 seconds for testing
                        });
                        
                        token = newAccessToken;
                    } catch (refreshError) {
                        throw new ApiError(httpStatus.UNAUTHORIZED, "Session expired, please login again");
                    }
                }
            }
            
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

function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as any;
        if (!decoded || !decoded.exp) return true;
        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}



export default authHelper;


