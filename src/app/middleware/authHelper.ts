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
            console.log("=== authHelper Debug ===");
            console.log("[authHelper] Request URL:", req.originalUrl);
            console.log("[authHelper] Request method:", req.method);
            console.log("[authHelper] Origin:", req.headers.origin);
            console.log("[authHelper] Cookies:", Object.keys(req.cookies));
            console.log("[authHelper] Authorization header:", req.headers.authorization ? `exists (${req.headers.authorization.substring(0, 30)}...)` : "missing");

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
                            config.ACCESS_TOKEN_EXPIRE as string
                        );

                        // Set new access token in cookie
                        res.cookie("accessToken", newAccessToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: "none",
                            maxAge: 15 * 60 * 1000
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
                    console.log("[authHelper] Using Authorization header token");
                }
            } else {
                console.log("[authHelper] Using cookie token");
            }

            if (!token) {
                console.log("[authHelper] ❌ No token found");
                throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
            }

            const verifyUser = await jwtHelper.verifyToken(token, config.ACCESS_TOKEN_SECRET)
            req.user = verifyUser
            console.log("[authHelper] ✅ Token verified, userId:", verifyUser.userId, "role:", verifyUser.role);

            if (roles.length && !roles.includes(verifyUser.role)) {
                console.log("[authHelper] ❌ Role mismatch. Required:", roles, "Got:", verifyUser.role);
                throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
            }
            next()
        } catch (error) {
            console.error("[authHelper] ❌ Error:", error);
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


