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
                        const verifyRefresh = await tokenGenarator_1.jwtHelper.verifyToken(refreshToken, config_1.default.REFRESH_TOKEN_SECRET);
                        // Generate new access token
                        const newAccessToken = tokenGenarator_1.jwtHelper.genarateToken({ userId: verifyRefresh.userId, role: verifyRefresh.role }, config_1.default.ACCESS_TOKEN_SECRET, config_1.default.ACCESS_TOKEN_EXPIRE);
                        // Set new access token in cookie
                        res.cookie("accessToken", newAccessToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: "none",
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
                    console.log("[authHelper] Using Authorization header token");
                }
            }
            else {
                console.log("[authHelper] Using cookie token");
            }
            if (!token) {
                console.log("[authHelper] ❌ No token found");
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "unauthorized access denied");
            }
            const verifyUser = await tokenGenarator_1.jwtHelper.verifyToken(token, config_1.default.ACCESS_TOKEN_SECRET);
            req.user = verifyUser;
            console.log("[authHelper] ✅ Token verified, userId:", verifyUser.userId, "role:", verifyUser.role);
            if (roles.length && !roles.includes(verifyUser.role)) {
                console.log("[authHelper] ❌ Role mismatch. Required:", roles, "Got:", verifyUser.role);
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "unauthorized access denied");
            }
            next();
        }
        catch (error) {
            console.error("[authHelper] ❌ Error:", error);
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
