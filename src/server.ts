import express from "express";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app";
import config from "./app/config";
let server: Server;
let io: SocketServer;

async function bootstrap() {
    try {
        server = app.listen(config.port, () => {
            console.log(`🚀server is running on http://localhost:${config.port}`);
        });

        // Setup Socket.IO
        io = new SocketServer(server, {
            cors: {
                origin: config.FRONTEND_URL,
                credentials: true,
            },
        });

        io.on("connection", (socket) => {
            const userId = socket.handshake.query.userId as string;

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
        (global as any).io = io;
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
