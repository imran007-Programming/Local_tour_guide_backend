import express from "express";
import { Server } from "http";
import { createServer } from "http";
import app from "./app";
import config from "./app/config";
import { initSocket } from "./app/lib/socket";
import axios from "axios";

let server: Server;
let keepAliveInterval: ReturnType<typeof setInterval>;

async function bootstrap() {
    try {
        server = createServer(app);
        initSocket(server);

        server.listen(config.port, () => {
            console.log(`🚀server is running on http://localhost:${config.port}`);

            //  Start keep-alive ONLY after server is up
            keepAliveInterval = setInterval(() => {
                axios
                    .get("https://local-tour-guide-backend.onrender.com")
                    .then(() => console.log("Keep-alive ping sent"))
                    .catch((err) => console.error(`Keep-alive failed: ${err.message}`));
            }, 78000);
        });

        const exitHandler = (code = 0) => {
            clearInterval(keepAliveInterval); // 👈 clean up before shutdown
            if (server) {
                server.close(() => {
                    console.log("server closed gracefully");
                    process.exit(code);
                });
            } else {
                process.exit(code);
            }
        };

        process.on("unhandledRejection", (error) => {
            console.log("Unhandled Rejection", error);
            exitHandler(1);
        });

        process.on("SIGTERM", () => exitHandler(0));
        process.on("SIGINT", () => exitHandler(0));

    } catch (error) {
        console.log("Something error happened..");
        process.exit(1);
    }
}

bootstrap();