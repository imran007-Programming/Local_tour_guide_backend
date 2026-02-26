"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const guide_service_1 = require("./guide.service");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const Pick_1 = __importDefault(require("../../helper/Pick"));
const guide_constant_1 = require("./guide.constant");
const getAllFromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = (0, Pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, Pick_1.default)(req.query, guide_constant_1.guideFilterableFields);
    const result = await guide_service_1.guideService.getAllFromDB(options, filters);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Guides retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getSingleFromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await guide_service_1.guideService.getSingleFromDB(String(id));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Guide retrieved successfully",
        data: result,
    });
});
const updateSingleFromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const payload = req.body;
    const result = await guide_service_1.guideService.updateSingleFromDB(userId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Guide retrieved successfully",
        data: result,
    });
});
exports.guideController = {
    getAllFromDB,
    getSingleFromDB,
    updateSingleFromDB
};
