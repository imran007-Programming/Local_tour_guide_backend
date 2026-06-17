import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { Request, Response } from "express";

import config from "./app/config";
import globalErrorHandler from "./app/middleware/GlobalErrorHandaler";
import notFound from "./app/middleware/NotFound";
import router from "./app/routes";
import { handleStripeWebhook } from "./app/modules/payment/payment.controller";

const app = express();

const allowedOrigins = [
    config.FRONTEND_URL,
    "https://tourguide-five.vercel.app",
    "https://tourguide.imrandev.xyz",
    "http://localhost:3000",
    "http://localhost:3001"
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.post(
    "/payments/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

// Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Health & root — BEFORE router so nothing intercepts them
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
});

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString(),
    });
});

app.use("/api", router);

// Webhook duplicate guard (already handled above, safe to keep)
app.use((req, res, next) => {
    if (req.originalUrl === "/api/payments/stripe/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;