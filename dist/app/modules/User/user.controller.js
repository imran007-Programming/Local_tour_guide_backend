"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const Pick_1 = __importDefault(require("../../helper/Pick"));
const user_constant_1 = require("./user.constant");
const getAllfromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = (0, Pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, Pick_1.default)(req.query, user_constant_1.userFilterableFields);
    const result = await user_service_1.userService.getAllfromDB(options, filters);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "user retrived Successfully",
        data: result
    });
});
const getSingleUserfromDB = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const result = await user_service_1.userService.getSingleUserfromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "user retrived Successfully",
        data: result
    });
});
const updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await user_service_1.userService.updateUser(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "profile updated successfully",
        data: result
    });
});
exports.userController = {
    getAllfromDB,
    getSingleUserfromDB,
    updateUser
};
