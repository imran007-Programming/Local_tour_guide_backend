import express from 'express';
import { userRoutes } from '../modules/User/user.route';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { guideRoutes } from '../modules/guide/guide.routes';
import { tourRoutes } from '../modules/tour/tour.routes';
import { bookingRoutes } from '../modules/Bookings/booking.routes';
import { reviewRoutes } from '../modules/review/review.routes';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { touristRoutes } from '../modules/tourist/tourist.routes';
const router = express.Router()

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/users",
        route: userRoutes
    },
    {
        path: "/guides",
        route: guideRoutes
    },
    {
        path: "/tourists",
        route: touristRoutes
    },
    {
        path: "/tour",
        route: tourRoutes
    },
    {
        path: "/bookings",
        route: bookingRoutes
    },
    {
        path: "/reviews",
        route: reviewRoutes
    },
    {
        path: "/payments",
        route: paymentRoutes
    }

]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

export default router