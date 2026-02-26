"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideRoutes = void 0;
const express_1 = __importDefault(require("express"));
const guide_controller_1 = require("./guide.controller");
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/", guide_controller_1.guideController.getAllFromDB);
router.get("/:id", guide_controller_1.guideController.getSingleFromDB);
router.patch("/", (0, authHelper_1.default)(client_1.Role.GUIDE), guide_controller_1.guideController.updateSingleFromDB);
exports.guideRoutes = router;
