"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authHelper = (...roles) => {
    return async (req, res, next) => {
        try {
            const accessToken = req.cookies["accessToken"];
            const refreshToken = req.cookies["refreshToken"];
            //  If no refresh token → user fully unauthorized
            if (!refreshToken) {
                return res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    message: "Please login again",
                });
            }
            let decodedUser = null;
            //  Try verifying access token if exists
            if (accessToken) {
                try {
                    decodedUser = jsonwebtoken_1.default.verify(accessToken, config_1.default.ACCESS_TOKEN_SECRET);
                }
                catch (error) {
                    decodedUser = null;
                }
            }
            //  If access token invalid or missing → use refresh token
            if (!decodedUser) {
                try {
                    const decodedRefresh = jsonwebtoken_1.default.verify(refreshToken, config_1.default.REFRESH_TOKEN_SECRET);
                    //  Generate new access token
                    const newAccessToken = jsonwebtoken_1.default.sign({
                        userId: decodedRefresh.userId,
                        role: decodedRefresh.role,
                    }, config_1.default.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
                    //  Set new cookie
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: 60 * 1000,
                    });
                    decodedUser = decodedRefresh;
                }
                catch {
                    return res.status(http_status_1.default.UNAUTHORIZED).json({
                        success: false,
                        message: "Session expired. Please login again.",
                    });
                }
            }
            req.user = decodedUser;
            //  Role checking
            if (roles.length && !roles.includes(decodedUser.role)) {
                return res.status(http_status_1.default.FORBIDDEN).json({
                    success: false,
                    message: "Forbidden",
                });
            }
            next();
        }
        catch {
            return res.status(http_status_1.default.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
        }
    };
};
exports.default = authHelper;
