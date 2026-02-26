"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Stats routes
router.get("/stats", (0, authHelper_1.default)(client_1.Role.ADMIN), booking_controller_1.bookingController.getAdminStats);
router.get("/assigned/stats", (0, authHelper_1.default)(client_1.Role.GUIDE), booking_controller_1.bookingController.getGuideStats);
router.get("/me/stats", (0, authHelper_1.default)(client_1.Role.TOURIST), booking_controller_1.bookingController.getTouristStats);
// Admin get all bookings
router.get("/", (0, authHelper_1.default)(client_1.Role.ADMIN), booking_controller_1.bookingController.getAllBookings);
// get the tourist booking list
router.get("/me", (0, authHelper_1.default)(client_1.Role.TOURIST), booking_controller_1.bookingController.getMyBookings);
// get the assigned booking for guide//
router.get("/assigned", (0, authHelper_1.default)(client_1.Role.GUIDE), booking_controller_1.bookingController.getAssignedBooking);
// Create a booking by Tourist
router.post("/", (0, authHelper_1.default)(client_1.Role.TOURIST), booking_controller_1.bookingController.createBooking);
// Booking cancel by reasone (By toutrist)
router.patch("/:bookingId/cancel", (0, authHelper_1.default)(client_1.Role.TOURIST), booking_controller_1.bookingController.cancelBooking);
// update the booking status by Guide(Pending -> CONFIRM/CANCEL)
router.patch("/:bookingId/respond", (0, authHelper_1.default)(client_1.Role.GUIDE), booking_controller_1.bookingController.updateBookingStatus);
// update the status after tour completed(By Guide)
router.patch("/:bookingId/complete", (0, authHelper_1.default)(client_1.Role.GUIDE), booking_controller_1.bookingController.completedBooking);
exports.bookingRoutes = router;
