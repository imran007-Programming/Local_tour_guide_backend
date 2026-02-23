import express from "express"
import { bookingController } from "./booking.controller";
import authHelper from "../../middleware/authHelper";
import { Role } from "@prisma/client";
import { authController } from "../Auth/auth.controller";
const router = express.Router()

// Stats routes
router.get("/stats", authHelper(Role.ADMIN), bookingController.getAdminStats)
router.get("/assigned/stats", authHelper(Role.GUIDE), bookingController.getGuideStats)
router.get("/me/stats", authHelper(Role.TOURIST), bookingController.getTouristStats)

// Admin get all bookings
router.get("/", authHelper(Role.ADMIN), bookingController.getAllBookings)

// get the tourist booking list
router.get("/me", authHelper(Role.TOURIST), bookingController.getMyBookings)

// get the assigned booking for guide//
router.get("/assigned", authHelper(Role.GUIDE), bookingController.getAssignedBooking)

// Create a booking by Tourist
router.post("/", authHelper(Role.TOURIST), bookingController.createBooking);

// Booking cancel by reasone (By toutrist)
router.patch("/:bookingId/cancel", authHelper(Role.TOURIST), bookingController.cancelBooking)


// update the booking status by Guide(Pending -> CONFIRM/CANCEL)
router.patch("/:bookingId/respond", authHelper(Role.GUIDE), bookingController.updateBookingStatus)



// update the status after tour completed(By Guide)
router.patch("/:bookingId/complete", authHelper(Role.GUIDE), bookingController.completedBooking)






export const bookingRoutes = router;