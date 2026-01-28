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

  // ALL FUNCTIONS DEFINED HERE
  
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
    console.log('🏠 joinRoom CALLED with:', roomId);
    console.log('🏠 Current room before:', currentRoom);
    
    if (currentRoom) {
      console.log('🚪 Leaving current room:', currentRoom);
      socketService.leaveRoom(currentRoom);
    }
    
    console.log('🚪 Setting current room to:', roomId);
    setCurrentRoom(roomId);
    
    console.log('🚪 Joining room via socket:', roomId);
    socketService.joinRoom(roomId);
    
    // Clear unread count
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, unread: 0 } : room
    ));
    
    console.log('✅ joinRoom COMPLETED');
  }, [currentRoom]);

  const sendMessage = useCallback((roomId, content) => {
    if (!user || !content.trim()) return;
    
    console.log('🔵 Sending message:', { roomId, content });
    
    // Create message object
    const newMessage = {
      id: Date.now() + Math.random(), // Unique ID
      roomId,
      content,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      timestamp: new Date().toISOString()
    };
    
    console.log('✨ Adding message to state immediately:', newMessage);
    
    // ✅ ADD TO STATE IMMEDIATELY (Optimistic Update)
    // This makes YOUR message appear instantly on YOUR screen
    setMessages(prev => {
      const updated = {
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMessage]
      };
      console.log('💾 Messages updated immediately:', updated);
      return updated;
    });
    
    // Then send to backend (for other users to see)
    socketService.sendMessage(roomId, content, user.id, user.name, user.avatar);
  }, [user]);

  const deleteMessage = useCallback((roomId, messageId) => {
    console.log('🗑️ Deleting message:', { roomId, messageId });
    
    // Delete locally immediately
    setMessages(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter(msg => msg.id !== messageId)
    }));
    
    // Then tell backend
    socketService.deleteMessage(roomId, messageId);
  }, []);

  const clearChat = useCallback((roomId) => {
    if (window.confirm('Are you sure you want to clear all messages in this room?')) {
      console.log('🧹 Clearing chat:', roomId);
      
      // Clear locally immediately
      setMessages(prev => ({
        ...prev,
        [roomId]: []
      }));
      
      // Then tell backend
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

      // Listen for new messages FROM OTHER USERS
      socketService.on('new_message', (message) => {
        console.log('📨 Received message from backend:', message);
        
        // Only add if it's from someone else (to avoid duplicates)
        if (message.userId !== user.id) {
          setMessages(prev => {
            const updated = {
              ...prev,
              [message.roomId]: [...(prev[message.roomId] || []), message]
            };
            console.log('💾 Messages state updated with other user message:', updated);
            return updated;
          });

          // Update unread count if not in current room
          if (message.roomId !== currentRoom) {
            setRooms(prev => prev.map(room => 
              room.id === message.roomId 
                ? { ...room, unread: room.unread + 1 }
                : room
            ));
          }
        } else {
          console.log('⏭️ Skipping own message (already added locally)');
        }
      });

      // Listen for message deleted
      socketService.on('message_deleted', ({ roomId, messageId }) => {
        console.log('🗑️ Message deleted (from backend):', { roomId, messageId });
        setMessages(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(msg => msg.id !== messageId)
        }));
      });

      // Listen for chat cleared
      socketService.on('chat_cleared', ({ roomId }) => {
        console.log('🧹 Chat cleared (from backend):', roomId);
        setMessages(prev => ({
          ...prev,
          [roomId]: []
        }));
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
        console.log('📚 Room history received:', roomId, roomMessages);
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
    deleteMessage,
    clearChat,
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