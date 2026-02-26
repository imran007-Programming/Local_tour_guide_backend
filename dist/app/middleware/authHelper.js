"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../error/ApiError"));
const tokenGenarator_1 = require("../helper/tokenGenarator");
const config_1 = __importDefault(require("../config"));
const authHelper = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies["accessToken"];
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
exports.default = authHelper;
