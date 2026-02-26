"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const auth_service_1 = require("./auth.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.authService.createUser(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: result,
    });
});
const login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.authService.login(req.body);
    const { accessToken, refreshToken } = result;
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 1000,
        path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 90 * 24 * 60 * 60 * 1000,
        path: "/",
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "user login successfully",
        data: result
    });
});
const logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    res.clearCookie("accessToken", {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    });
    res.clearCookie("refreshToken", {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "logout successfully",
        data: null
    });
});
// Genarate Refresh Token
const getRefreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    try {
        const refreshToken = req.cookies["refreshToken"];
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.REFRESH_TOKEN_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({
            userId: decoded.userId,
            role: decoded.role,
        }, config_1.default.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });
        return res.status(200).json({
            success: true,
            message: "Token refreshed",
        });
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Refresh token expired",
        });
    }
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    const result = await auth_service_1.authService.getME(user);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "profile Retrived successfully",
        data: result
    });
});
exports.authController = {
    createUser,
    login,
    getMe,
    getRefreshToken,
    logout
};
