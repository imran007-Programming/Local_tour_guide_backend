"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("./user.validation");
const fileUploader_1 = require("../../helper/fileUploader");
const router = express_1.default.Router();
router.get("/", (0, authHelper_1.default)(client_1.Role.ADMIN), user_controller_1.userController.getAllfromDB);
router.get("/:id", (0, authHelper_1.default)(client_1.Role.ADMIN), user_controller_1.userController.getSingleUserfromDB);
router.patch("/update-profile", (0, authHelper_1.default)(client_1.Role.ADMIN, client_1.Role.GUIDE, client_1.Role.TOURIST), fileUploader_1.fileUploader.upload.single("profilePic"), (0, validateRequest_1.default)(user_validation_1.updateUserZodSchema), user_controller_1.userController.updateUser);
exports.userRoutes = router;
