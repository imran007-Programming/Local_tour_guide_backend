"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNewMessage = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: config_1.default.FRONTEND_URL || "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0];
        if (!token) {
            return next();
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.ACCESS_TOKEN_SECRET);
            socket.userId = decoded.userId;
            next();
        }
        catch (err) {
            next();
        }
    });
    io.on("connection", (socket) => {
        // Join user to their own room
        if (socket.userId) {
            socket.join(socket.userId);
        }
        // Broadcast user online status
        socket.broadcast.emit("user-online", socket.userId);
        // Join conversation room
        socket.on("join-conversation", (conversationId) => {
            socket.join(conversationId);
        });
        // Typing indicators
        socket.on("typing", (data) => {
            io.to(data.receiverId).emit("user-typing", { userId: data.userId, conversationId: data.conversationId });
        });
        socket.on("stop-typing", (data) => {
            io.to(data.receiverId).emit("user-stopped-typing", { userId: data.userId, conversationId: data.conversationId });
        });
        // Handle disconnect
        socket.on("disconnect", () => {
            socket.broadcast.emit("user-offline", socket.userId);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
exports.getIO = getIO;
const emitNewMessage = (message) => {
    if (io) {
        // Emit to conversation room
        io.to(message.conversationId).emit("new-message", message);
        // Emit directly to receiver's user room for instant delivery
        if (message.receiverId) {
            io.to(message.receiverId).emit("new-message", message);
        }
    }
};
exports.emitNewMessage = emitNewMessage;
