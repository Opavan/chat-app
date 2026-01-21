import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [rooms, setRooms] = useState([
    { id: 'general', name: 'General', avatar: '👨‍💼', unread: 0 },
    { id: 'random', name: 'Random', avatar: '👩‍🎨', unread: 0 },
    { id: 'tech', name: 'Tech Talk', avatar: '👨‍💻', unread: 0 },
    { id: 'gaming', name: 'Gaming', avatar: '👾', unread: 0 }
  ]);

  // ALL FUNCTIONS DEFINED HERE (BEFORE useEffect and value object)
  
  const login = useCallback((name, avatar) => {
    const newUser = {
      id: Date.now(),
      name,
      avatar,
      status: 'online'
    };
    setUser(newUser);
    localStorage.setItem('chatUser', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    socketService.disconnect();
    setUser(null);
    setCurrentRoom(null);
    setMessages({});
    setOnlineUsers([]);
    localStorage.removeItem('chatUser');
  }, []);

  const joinRoom = useCallback((roomId) => {
    if (currentRoom) {
      socketService.leaveRoom(currentRoom);
    }
    setCurrentRoom(roomId);
    socketService.joinRoom(roomId);
    
    // Clear unread count
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, unread: 0 } : room
    ));
  }, [currentRoom]);

  const sendMessage = useCallback((roomId, content) => {
    if (!user || !content.trim()) return;
    
    console.log('🔵 Sending message:', { roomId, content });
    
    // Send to socket with all user data
    socketService.sendMessage(roomId, content, user.id, user.name, user.avatar);
  }, [user]);
      const deleteMessage = useCallback((roomId, messageId) => {
      console.log('🗑️ Deleting message:', { roomId, messageId });
    socketService.deleteMessage(roomId, messageId);
  }, []);

  const clearChat = useCallback((roomId) => {
    if (window.confirm('Are you sure you want to clear all messages in this room?')) {
      console.log('🧹 Clearing chat:', roomId);
      socketService.clearChat(roomId);
    }
  }, []);
  const setTyping = useCallback((roomId, isTyping) => {
    if (!user) return;
    socketService.typing(roomId, user.id, isTyping);
  }, [user]);

  // Initialize socket listeners
  useEffect(() => {
    if (user) {
      socketService.connect(user.id);

      // Listen for new messages
      socketService.on('new_message', (message) => {
        console.log('📨 Received message:', message);
        setMessages(prev => ({
          ...prev,
          [message.roomId]: [...(prev[message.roomId] || []), message]
        }));

        // Update unread count
        if (message.roomId !== currentRoom) {
          setRooms(prev => prev.map(room => 
            room.id === message.roomId 
              ? { ...room, unread: room.unread + 1 }
              : room
          ));
        }
      });

      // Listen for typing events
      socketService.on('user_typing', ({ userId, roomId, isTyping, userName }) => {
        setTypingUsers(prev => {
          const roomTyping = prev[roomId] || [];
          if (isTyping) {
            return {
              ...prev,
              [roomId]: [...roomTyping.filter(u => u.userId !== userId), { userId, userName }]
            };
          } else {
            return {
              ...prev,
              [roomId]: roomTyping.filter(u => u.userId !== userId)
            };
          }
        });
      });

      // Listen for online users
      socketService.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      // Listen for room history
      socketService.on('room_history', ({ roomId, messages: roomMessages }) => {
        setMessages(prev => ({
          ...prev,
          [roomId]: roomMessages
        }));
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user, currentRoom]);

  // Auto-login from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    currentRoom,
    messages,
    onlineUsers,
    typingUsers,
    rooms,
    sendMessage,
    joinRoom,
    setTyping,
    login,
    logout
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};