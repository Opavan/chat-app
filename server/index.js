const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage
const messages = {};
const users = new Map();
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining a room
  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    
    // Track user in room
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(socket.id);

    // Send room history to the user who just joined
    socket.emit('room_history', {
      roomId,
      messages: messages[roomId] || []
    });

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle leaving room
  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    
    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(socket.id);
    }
    
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle new message
  socket.on('send_message', (data) => {
    const message = {
      ...data,
      id: Date.now() + Math.random(), // Unique ID
      timestamp: new Date().toISOString()
    };

    // Store message
    if (!messages[data.roomId]) {
      messages[data.roomId] = [];
    }
    messages[data.roomId].push(message);

    // Broadcast to ALL users in the room (including sender)
    io.to(data.roomId).emit('new_message', message);
    
    console.log(`Message sent to room ${data.roomId}:`, message.content);
  });

  // Handle delete message
  socket.on('delete_message', ({ roomId, messageId }) => {
    if (messages[roomId]) {
      // Remove message from storage
      messages[roomId] = messages[roomId].filter(msg => msg.id !== messageId);
      
      // Broadcast deletion to all users in the room
      io.to(roomId).emit('message_deleted', { roomId, messageId });
      
      console.log(`Message ${messageId} deleted from room ${roomId}`);
    }
  });

  // Handle clear chat
  socket.on('clear_chat', ({ roomId }) => {
    // Clear all messages in the room
    messages[roomId] = [];
    
    // Broadcast to all users in the room
    io.to(roomId).emit('chat_cleared', { roomId });
    
    console.log(`Chat cleared in room ${roomId}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ roomId, userId, isTyping }) => {
    // Broadcast to others in the room (NOT to sender)
    socket.to(roomId).emit('user_typing', {
      userId,
      roomId,
      isTyping,
      userName: users.get(socket.id)?.name || 'Someone'
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);
    
    // Remove from all rooms
    roomUsers.forEach((usersSet, roomId) => {
      if (usersSet.has(socket.id)) {
        usersSet.delete(socket.id);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});