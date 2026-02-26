import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

import config from "./app/config";
import globalErrorHandler from "./app/middleware/GlobalErrorHandaler";
import notFound from "./app/middleware/NotFound";
import router from "./app/routes";
import { handleStripeWebhook } from "./app/modules/payment/payment.controller";

const app = express();
app.use(
    cors({
        origin: config.FRONTEND_URL,
        credentials: true,
    })
);

app.post(
    "/payments/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
)


// Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use("/api", router);

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === "api/payments/stripe/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.get("/", (req, res) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString(),
    });
})
app.use(globalErrorHandler);
app.use(notFound);
export default app;