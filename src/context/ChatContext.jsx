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
    setRooms(prev => prev.map(room =>
      room.id === roomId ? { ...room, unread: 0 } : room
    ));
  }, [currentRoom]);

  const sendMessage = useCallback((roomId, content, type = 'text') => {
    if (!user || !content) return;
    socketService.sendMessage(roomId, content, user.id, user.name, user.avatar, type);
  }, [user]);

  const deleteMessage = useCallback((roomId, messageId) => {
    setMessages(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter(msg => msg.id !== messageId)
    }));
    socketService.deleteMessage(roomId, messageId);
  }, []);

  const clearChat = useCallback((roomId) => {
    if (window.confirm('Are you sure you want to clear all messages in this room?')) {
      setMessages(prev => ({ ...prev, [roomId]: [] }));
      socketService.clearChat(roomId);
    }
  }, []);

  const setTyping = useCallback((roomId, isTyping) => {
    if (!user) return;
    socketService.typing(roomId, user.id, isTyping);
  }, [user]);

  const markRead = useCallback((roomId, messageId) => {
    if (!user) return;
        console.log(' markRead called:', roomId, messageId);
    socketService.markRead(roomId, messageId, user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    socketService.connect(user.id);
    socketService.removeAllListeners();

    socketService.on('new_message', (message) => {
      setMessages(prev => {
        const roomMessages = prev[message.roomId] || [];
        const alreadyExists = roomMessages.some(msg => msg.id === message.id);
        if (alreadyExists) return prev;
        return {
          ...prev,
          [message.roomId]: [...roomMessages, message],
        };
      });
    });

    socketService.on('message_deleted', ({ roomId, messageId }) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter(msg => msg.id !== messageId)
      }));
    });

    socketService.on('chat_cleared', ({ roomId }) => {
      setMessages(prev => ({ ...prev, [roomId]: [] }));
    });

    socketService.on('user_typing', ({ userId, roomId, isTyping, userName }) => {
      setTypingUsers(prev => {
        const roomTyping = prev[roomId] || [];
        if (isTyping) {
          return {
            ...prev,
            [roomId]: [...roomTyping.filter(u => u.userId !== userId), { userId, userName }]
          };
        }
        return { ...prev, [roomId]: roomTyping.filter(u => u.userId !== userId) };
      });
    });

    socketService.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socketService.on('room_history', ({ roomId, messages: roomMessages }) => {
      setMessages(prev => ({ ...prev, [roomId]: roomMessages }));
    });

    socketService.on('message_read', ({ roomId, messageId, userId }) => {
      setMessages(prev => {
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: roomMessages.map(msg =>
            msg.id === messageId
              ? { ...msg, readBy: [...(msg.readBy || []), userId] }
              : msg
          ),
        };
      });
    });

    return () => {
      socketService.removeAllListeners();
    };

  }, [user]);

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
    deleteMessage,
    clearChat,
    joinRoom,
    setTyping,
    markRead,
    login,
    logout
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};