# Chat API Documentation

## Overview
Real-time chat system with Socket.IO for tourists and guides to communicate.

## Database Schema

### Conversation
- `id`: UUID
- `user1Id`: String
- `user2Id`: String
- `messages`: Message[]
- Unique constraint on [user1Id, user2Id]

### Message
- `id`: UUID
- `conversationId`: String
- `senderId`: String
- `content`: String
- `isRead`: Boolean (default: false)
- `createdAt`: DateTime

## REST API Endpoints

### 1. Send Message
**POST** `/api/chat/send`
- **Auth**: Required (GUIDE, TOURIST)
- **Body**: 
  ```json
  {
    "receiverId": "user-uuid",
    "content": "message text"
  }
  ```
- **Response**: Message object with conversationId

### 2. Get Conversations
**GET** `/api/chat/conversations`
- **Auth**: Required (GUIDE, TOURIST)
- **Response**: Array of conversations with other user info and unread count

### 3. Get Messages
**GET** `/api/chat/:conversationId/messages`
- **Auth**: Required (GUIDE, TOURIST)
- **Response**: Array of messages with sender info
- **Side Effect**: Marks messages as read

## Socket.IO Events

### Client → Server
- `join-conversation`: Join a conversation room
  ```js
  socket.emit("join-conversation", conversationId)
  ```

### Server → Client
- `new-message`: New message received
  ```js
  socket.on("new-message", (message) => {})
  ```
- `user-online`: User came online
  ```js
  socket.on("user-online", (userId) => {})
  ```
- `user-offline`: User went offline
  ```js
  socket.on("user-offline", (userId) => {})
  ```

## Connection
Socket.IO connects to: `http://localhost:5000` (without /api)

## Setup Complete ✅
- Database migration applied
- Socket.IO initialized
- Routes registered
- Ready to use!
