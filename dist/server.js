"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const socket_1 = require("./app/lib/socket");
const axios_1 = __importDefault(require("axios"));
let server;
let keepAliveInterval;
async function bootstrap() {
    try {
        server = (0, http_1.createServer)(app_1.default);
        (0, socket_1.initSocket)(server);
        server.listen(config_1.default.port, () => {
            console.log(`🚀server is running on http://localhost:${config_1.default.port}`);
            // ✅ ping /health with validateStatus so 404 never throws
            keepAliveInterval = setInterval(() => {
                axios_1.default
                    .get("https://local-tour-guide-backend-1.onrender.com/health", {
                    validateStatus: () => true,
                })
                    .then((res) => console.log(`Keep-alive ping sent — status: ${res.status}`))
                    .catch((err) => console.error(`Keep-alive failed: ${err.message}`));
            }, 780000);
        });
        const exitHandler = (code = 0) => {
            clearInterval(keepAliveInterval);
            if (server) {
                server.close(() => {
                    console.log("server closed gracefully");
                    process.exit(code);
                });
            }
            else {
                process.exit(code);
            }
        };
        process.on("unhandledRejection", (error) => {
            console.log("Unhandled Rejection", error);
            exitHandler(1);
        });
        process.on("SIGTERM", () => exitHandler(0));
        process.on("SIGINT", () => exitHandler(0));
    }
    catch (error) {
        console.log("Something error happened..");
        process.exit(1);
    }
}
bootstrap();
