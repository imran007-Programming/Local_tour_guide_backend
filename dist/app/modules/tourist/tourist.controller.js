"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.touristController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const tourist_service_1 = require("./tourist.service");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const getAllFromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await tourist_service_1.touristService.getAllFromDB(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tourists retrieved successfully",
        data: result,
    });
});
const getSingleFromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await tourist_service_1.touristService.getSingleFromDB(String(id));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tourist retrieved successfully",
        data: result,
    });
});
const updateSingleFromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const payload = req.body;
    const result = await tourist_service_1.touristService.updateSingleFromDB(userId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tourist updated successfully",
        data: result,
    });
});
exports.touristController = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
