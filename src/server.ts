import express from "express";
import { Server } from "http";
import app from "./app";
import config from "./app/config";
let server: Server;

async function bootstrap() {
    try {
        server = app.listen(config.port, () => {
            console.log(`🚀server is running on http://localhost:${config.port}`);
        });
        // handle server shutdown gracefully
        const exitHandler = (code = 0) => {
            if (server) {
                server.close(() => {
                    console.log("server closed gracefully");
                    process.exit(code);
                });
            } else {
                process.exit(code);
            }
        };
        // Handle unhandle promise rejection'
        process.on("unhandledRejection", (error) => {
            console.log("Unhandaled Rejection", error);
            exitHandler(1);
        });
        // Normal shutdown
        process.on("SIGTERM", () => exitHandler(0));
        process.on("SIGINT", () => exitHandler(0));
    } catch (error) {
        console.log("Something error happened..");
        process.exit(1);
    }
}

bootstrap();
