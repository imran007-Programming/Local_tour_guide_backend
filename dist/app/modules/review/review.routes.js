"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const review_controller_1 = require("./review.controller");
const router = express_1.default.Router();
router.get("/", review_controller_1.reviewController.getAllReviews);
router.get("/tour/:tourId", review_controller_1.reviewController.getTourReviews);
router.get("/guide/:guideId", review_controller_1.reviewController.getGuideReviews);
router.get("/me", (0, authHelper_1.default)(client_1.Role.TOURIST), review_controller_1.reviewController.getMyReviews);
router.post("/", (0, authHelper_1.default)(client_1.Role.TOURIST), review_controller_1.reviewController.createReview);
router.patch("/:id", (0, authHelper_1.default)(client_1.Role.TOURIST), review_controller_1.reviewController.updateReview);
router.delete("/:id", (0, authHelper_1.default)(client_1.Role.TOURIST, client_1.Role.ADMIN), review_controller_1.reviewController.deleteReview);
exports.reviewRoutes = router;
