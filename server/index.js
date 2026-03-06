const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 👇 Groq setup
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    console.log('🤖 AI Request received:', message);

    // Convert chat history to Groq format
    const history = (chatHistory || []).map((msg) => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant inside a chat application. 
          Keep responses concise and conversational. Max 3-4 sentences.`,
        },
        ...history,
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 300,
    });

    const reply = response.choices[0]?.message?.content || 'I could not respond.';
    console.log('✅ AI replied successfully');
    res.json({ success: true, reply });

  } catch (error) {
    console.error('AI Error:', error.message);
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