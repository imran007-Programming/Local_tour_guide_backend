"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authHelper_1 = __importDefault(require("../../middleware/authHelper"));
const client_1 = require("@prisma/client");
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
router.post("/stripe/create-intent", (0, authHelper_1.default)(client_1.Role.TOURIST), payment_controller_1.paymentController.createStripeIntent);
router.post("/checkout", (0, authHelper_1.default)(client_1.Role.TOURIST), payment_controller_1.paymentController.createCheckoutSession);
router.post("/webhook", express_1.default.json({ type: "application/json" }), payment_controller_1.paymentController.handleStripeWebhook);
exports.paymentRoutes = router;
