const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    console.log(' AI Request received:', message); //  NEW

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are a helpful AI assistant inside a chat application. 
    Keep responses concise and conversational. Max 3-4 sentences.`;

    const history = (chatHistory || []).map((msg) => ({
      role: msg.isAI ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: { maxOutputTokens: 300 },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const reply = result.response.text();

    console.log(' AI replied successfully'); //
    res.json({ success: true, reply });

  } catch (error) {
    console.error('AI Error:', error.message);

    //  NEW — Handle rate limit specifically
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit reached. Please wait a moment and try again.',
      });
    }

    res.status(500).json({ success: false, error: 'AI failed to respond' });
  }
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const messages = {};
const users = new Map();
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(socket.id);

    socket.emit('room_history', {
      roomId,
      messages: messages[roomId] || [],
    });

    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);

    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(socket.id);
    }

    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    const message = {
      ...data,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    };

    if (!messages[data.roomId]) {
      messages[data.roomId] = [];
    }
    messages[data.roomId].push(message);

    io.to(data.roomId).emit('new_message', message);

    console.log(`Message sent to room ${data.roomId}:`, message.content);
  });

  socket.on('ai_message', (data) => {
    const aiMessage = {
      ...data,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      isAI: true,
      sender: 'AI Assistant',
    };

    if (!messages[data.roomId]) {
      messages[data.roomId] = [];
    }
    messages[data.roomId].push(aiMessage);

    io.to(data.roomId).emit('new_message', aiMessage);
  });

  socket.on('delete_message', ({ roomId, messageId }) => {
    if (messages[roomId]) {
      messages[roomId] = messages[roomId].filter((msg) => msg.id !== messageId);
      io.to(roomId).emit('message_deleted', { roomId, messageId });
      console.log(`Message ${messageId} deleted from room ${roomId}`);
    }
  });

  socket.on('clear_chat', ({ roomId }) => {
    messages[roomId] = [];
    io.to(roomId).emit('chat_cleared', { roomId });
    console.log(`Chat cleared in room ${roomId}`);
  });

  socket.on('typing', ({ roomId, userId, isTyping }) => {
    socket.to(roomId).emit('user_typing', {
      userId,
      roomId,
      isTyping,
      userName: users.get(socket.id)?.name || 'Someone',
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    users.delete(socket.id);

    roomUsers.forEach((usersSet) => {
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