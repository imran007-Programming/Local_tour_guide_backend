"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.touristRoutes = void 0;
const express_1 = __importDefault(require("express"));
const tourist_controller_1 = require("./tourist.controller");
const wishlist_controller_1 = require("./wishlist.controller");
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/getallwishlist", (0, authHelper_1.default)(client_1.Role.TOURIST), wishlist_controller_1.wishlistController.getWishlist);
router.get("/", tourist_controller_1.touristController.getAllFromDB);
router.get("/:id", tourist_controller_1.touristController.getSingleFromDB);
router.patch("/", (0, authHelper_1.default)(client_1.Role.TOURIST), tourist_controller_1.touristController.updateSingleFromDB);
router.post("/wishlist", (0, authHelper_1.default)(client_1.Role.TOURIST), wishlist_controller_1.wishlistController.addToWishlist);
router.delete("/wishlist/:tourId", (0, authHelper_1.default)(client_1.Role.TOURIST), wishlist_controller_1.wishlistController.removeFromWishlist);
exports.touristRoutes = router;
