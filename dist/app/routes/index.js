"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/User/user.route");
const auth_routes_1 = require("../modules/Auth/auth.routes");
const guide_routes_1 = require("../modules/guide/guide.routes");
const tour_routes_1 = require("../modules/tour/tour.routes");
const booking_routes_1 = require("../modules/Bookings/booking.routes");
const review_routes_1 = require("../modules/review/review.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const tourist_routes_1 = require("../modules/tourist/tourist.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes
    },
    {
        path: "/users",
        route: user_route_1.userRoutes
    },
    {
        path: "/guides",
        route: guide_routes_1.guideRoutes
    },
    {
        path: "/tourists",
        route: tourist_routes_1.touristRoutes
    },
    {
        path: "/tour",
        route: tour_routes_1.tourRoutes
    },
    {
        path: "/bookings",
        route: booking_routes_1.bookingRoutes
    },
    {
        path: "/reviews",
        route: review_routes_1.reviewRoutes
    },
    {
        path: "/payments",
        route: payment_routes_1.paymentRoutes
    }
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
