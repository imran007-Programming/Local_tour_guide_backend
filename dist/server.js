"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
let server;
async function bootstrap() {
    try {
        server = app_1.default.listen(config_1.default.port, () => {
            console.log(`🚀server is running on http://localhost:${config_1.default.port}`);
        });
        // handle server shutdown gracefully
        const exitHandler = (code = 0) => {
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
        // Handle unhandle promise rejection'
        process.on("unhandledRejection", (error) => {
            console.log("Unhandaled Rejection", error);
            exitHandler(1);
        });
        // Normal shutdown
        process.on("SIGTERM", () => exitHandler(0));
        process.on("SIGINT", () => exitHandler(0));
    }
    catch (error) {
        console.log("Something error happened..");
        process.exit(1);
    }
}
bootstrap();
