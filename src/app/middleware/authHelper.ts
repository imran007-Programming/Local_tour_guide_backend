import httpStatus from 'http-status';
import { NextFunction, Request, Response } from "express"
import ApiError from "../error/ApiError"
import { jwtHelper } from '../helper/tokenGenarator';
import { Role } from '@prisma/client';
import config from '../config';


import jwt from "jsonwebtoken";


// const authHelper = (...roles: string[]) => {
//     return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
//         try {
//             const token = req.cookies["accessToken"]
//             if (!token) {
//                 throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
//             }
//             const verifyUser = await jwtHelper.verifyToken(token, config.ACCESS_TOKEN_SECRET)

//             req.user = verifyUser


//             if (roles.length && !roles.includes(verifyUser.role)) {
//                 throw new ApiError(httpStatus.UNAUTHORIZED, "unauthorized access denied")
//             }
//             next()
//         } catch (error) {
//             next(error)
//         }
//     }

// }
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

            // ✅ 1️⃣ Try verifying access token if exists
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


            // ✅ 2️⃣ If access token invalid or missing → use refresh token
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
                        { expiresIn: "1m" }
                    );

                    // 🔥 Set new cookie
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: false, // true in production (HTTPS)
                        sameSite: "lax",
                        maxAge: 60 * 1000,
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

            // ✅ 3️⃣ Role checking
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


// import httpStatus from "http-status";
// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import config from "../config";

// const authHelper = (...roles: string[]) => {
//     return async (
//         req: Request & { user?: any },
//         res: Response,
//         next: NextFunction
//     ) => {
//         try {
//             const accessToken = req.cookies["accessToken"];
//             const refreshToken = req.cookies["refreshToken"];

//             //  If no refresh token → user fully unauthorized
//             if (!refreshToken) {
//                 return res.status(httpStatus.UNAUTHORIZED).json({
//                     success: false,
//                     message: "Please login again",
//                 });
//             }

//             let decodedUser: any = null;

//             // ✅ 1️⃣ Try verifying access token if exists
//             if (accessToken) {
//                 try {
//                     decodedUser = jwt.verify(
//                         accessToken,
//                         config.ACCESS_TOKEN_SECRET
//                     );
//                 } catch (error: any) {

//                     decodedUser = null;
//                 }
//             }


//             // ✅ 2️⃣ If access token invalid or missing → use refresh token
//             if (!decodedUser) {
//                 try {
//                     const decodedRefresh = jwt.verify(
//                         refreshToken,
//                         config.REFRESH_TOKEN_SECRET
//                     ) as any;

//                     //  Generate new access token
//                     const newAccessToken = jwt.sign(
//                         {
//                             userId: decodedRefresh.userId,
//                             role: decodedRefresh.role,
//                         },
//                         config.ACCESS_TOKEN_SECRET,
//                         { expiresIn: "1m" }
//                     );

//                     // 🔥 Set new cookie
//                     res.cookie("accessToken", newAccessToken, {
//                         httpOnly: true,
//                         secure: false, // true in production (HTTPS)
//                         sameSite: "lax",
//                         maxAge: 60 * 1000,
//                     });

//                     decodedUser = decodedRefresh;
//                 } catch {
//                     return res.status(httpStatus.UNAUTHORIZED).json({
//                         success: false,
//                         message: "Session expired. Please login again.",
//                     });
//                 }
//             }

//             req.user = decodedUser;

//             // ✅ 3️⃣ Role checking
//             if (roles.length && !roles.includes(decodedUser.role)) {
//                 return res.status(httpStatus.FORBIDDEN).json({
//                     success: false,
//                     message: "Forbidden",
//                 });
//             }

//             next();
//         } catch {
//             return res.status(httpStatus.UNAUTHORIZED).json({
//                 success: false,
//                 message: "Unauthorized",
//             });
//         }
//     };
// };

// export default authHelper;