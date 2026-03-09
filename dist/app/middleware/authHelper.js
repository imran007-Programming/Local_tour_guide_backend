"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../error/ApiError"));
const tokenGenarator_1 = require("../helper/tokenGenarator");
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authHelper = (...roles) => {
    return async (req, res, next) => {
        try {
            // Check cookie first, then Authorization header
            let token = req.cookies["accessToken"];
            // If no access token or expired, try to refresh
            if (!token || isTokenExpired(token)) {
                const refreshToken = req.cookies["refreshToken"];
                if (refreshToken) {
                    try {
                        const verifyRefresh = await tokenGenarator_1.jwtHelper.verifyToken(refreshToken, config_1.default.REFRESH_TOKEN_SECRET);
                        // Generate new access token
                        const newAccessToken = tokenGenarator_1.jwtHelper.genarateToken({ userId: verifyRefresh.userId, role: verifyRefresh.role }, config_1.default.ACCESS_TOKEN_SECRET, config_1.default.ACCESS_TOKEN_EXPIRE);
                        // Set new access token in cookie
                        res.cookie("accessToken", newAccessToken, {
                            httpOnly: true,
                            secure: config_1.default.node_env === "production",
                            sameSite: "lax",
                            maxAge: 15 * 60 * 1000
                        });
                        token = newAccessToken;
                    }
                    catch (refreshError) {
                        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Session expired, please login again");
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
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "unauthorized access denied");
            }
            const verifyUser = await tokenGenarator_1.jwtHelper.verifyToken(token, config_1.default.ACCESS_TOKEN_SECRET);
            req.user = verifyUser;
            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "unauthorized access denied");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
function isTokenExpired(token) {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp)
            return true;
        return decoded.exp * 1000 < Date.now();
    }
    catch {
        return true;
    }
}
exports.default = authHelper;
