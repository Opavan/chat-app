#  Real-Time Chat Application

A modern real-time chat app built with React, Socket.IO, and Node.js.

![React](https://img.shields.io/badge/React-18.2.0-blue) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.1-green) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

##  Features

- 💬 **Real-time messaging** across multiple chat rooms
- 👥 **Online users** with status indicators
- ✍️ **Typing indicators** 
- 😊 **Emoji picker** with 30+ emojis
- 🗑️ **Delete messages** and clear chat
- 👤 **Custom avatars** - 16 professional options
- ⚙️ **Profile & Settings** page
- 📱 **Fully responsive** design
- 🔔 **Unread message badges**

---

##  Quick Start

```bash
# Clone the repo
git clone <your-repo-url>
cd chat-app-ui

# Install dependencies
npm install
cd server && npm install && cd ..

# Install concurrently
npm install -D concurrently

# Run both frontend and backend
npm run dev:all
```

**Open:** `http://localhost:3000`

---

##  Test Real-Time Chat

1. **Window 1:** Login as "Alice" → Join "General"
2. **Window 2 (Incognito):** Login as "Bob" → Join "General"
3. **Send messages** - they appear instantly for both users! 

---

##  Project Structure

```
chat-app-ui/
├── src/
│   ├── components/      # UI components
│   ├── pages/          # Login & Chat pages
│   ├── context/        # State management
│   └── services/       # Socket.IO service
├── server/             # Backend (Node.js + Socket.IO)
└── package.json
```

---

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Socket.IO Client  
**Backend:** Node.js, Express, Socket.IO  
**Icons:** Lucide React

---

##  Available Scripts

```bash
npm run dev        # Frontend only (port 3000)
npm run server     # Backend only (port 3001)
npm run dev:all    # Both servers
npm run build      # Production build
```

---

##  Troubleshooting

**Messages not showing?**
- Check backend is running: `Server running on port 3001`
- Check browser console: `✅ Connected to backend server`
- Make sure you've joined a room

**Port already in use?**
```bash
# Kill process on port 3001
netstat -ano | findstr :3001    # Windows
lsof -ti:3001 | xargs kill -9   # Mac/Linux
```

---

##  How It Works

1. **Login** with your name and avatar
2. **Join a room** (General, Random, Tech Talk, Gaming)
3. **Send messages** that appear instantly for all users
4. **Delete your messages** or clear entire chat
5. **See typing indicators** when others type

---

##  Socket Events

**Send:** `send_message`, `delete_message`, `clear_chat`, `typing`  
**Receive:** `new_message`, `message_deleted`, `chat_cleared`, `user_typing`

---

##  Future Features

- [ ] File/image sharing
- [ ] Private messages
- [ ] Message reactions
- [ ] Voice/video calls
- [ ] User authentication
- [ ] Database persistence

---

##  License

MIT License - feel free to use this project!

---

##  Contributing

Pull requests are welcome! Fork → Branch → Commit → Push → PR

---

**Made with ❤️ using React & Socket.IO**