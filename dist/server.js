"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
let server;
let io;
async function bootstrap() {
    try {
        server = app_1.default.listen(config_1.default.port, () => {
            console.log(`🚀server is running on http://localhost:${config_1.default.port}`);
        });
        // Setup Socket.IO
        io = new socket_io_1.Server(server, {
            cors: {
                origin: config_1.default.FRONTEND_URL,
                credentials: true,
            },
        });
        io.on("connection", (socket) => {
            const userId = socket.handshake.query.userId;
            if (userId) {
                socket.join(userId);
                io.emit("user-online", userId);
            }
            socket.on("join-conversation", (conversationId) => {
                socket.join(conversationId);
            });
            socket.on("send-message", (data) => {
                io.to(data.conversationId).emit("new-message", data.message);
            });
            socket.on("disconnect", () => {
                if (userId) {
                    io.emit("user-offline", userId);
                }
            });
        });
        // Make io available globally
        global.io = io;
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
