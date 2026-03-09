import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config";
import { chatService } from "../modules/chat/chat.service";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: SocketIOServer;

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0];
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET) as any;
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next();
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    // Join user to their own room
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Broadcast user online status
    socket.broadcast.emit("user-online", socket.userId);

    // Join conversation room
    socket.on("join-conversation", (conversationId: string) => {
      socket.join(conversationId);
    });

    // Typing indicators
    socket.on("typing", (data: { conversationId: string; userId: string; receiverId: string }) => {
      io.to(data.receiverId).emit("user-typing", { userId: data.userId, conversationId: data.conversationId });
    });

    socket.on("stop-typing", (data: { conversationId: string; userId: string; receiverId: string }) => {
      io.to(data.receiverId).emit("user-stopped-typing", { userId: data.userId, conversationId: data.conversationId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      socket.broadcast.emit("user-offline", socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

export const emitNewMessage = (message: any) => {
  if (io) {
    // Emit to conversation room
    io.to(message.conversationId).emit("new-message", message);
    
    // Emit directly to receiver's user room for instant delivery
    if (message.receiverId) {
      io.to(message.receiverId).emit("new-message", message);
    }
  }
};