"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./app/config"));
const GlobalErrorHandaler_1 = __importDefault(require("./app/middleware/GlobalErrorHandaler"));
const NotFound_1 = __importDefault(require("./app/middleware/NotFound"));
const routes_1 = __importDefault(require("./app/routes"));
const payment_controller_1 = require("./app/modules/payment/payment.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.default.FRONTEND_URL,
    credentials: true,
}));
app.post("/payments/stripe/webhook", express_1.default.raw({ type: "application/json" }), payment_controller_1.handleStripeWebhook);
// Parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api", routes_1.default);
// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === "api/payments/stripe/webhook") {
        next();
    }
    else {
        express_1.default.json()(req, res, next);
    }
});
app.get("/", (req, res) => {
    res.send({
        message: "Server is running..",
        environment: config_1.default.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString(),
    });
});
app.use(GlobalErrorHandaler_1.default);
app.use(NotFound_1.default);
exports.default = app;
