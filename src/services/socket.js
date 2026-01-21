import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    try {
      this.socket = io(SOCKET_URL, {
        auth: { userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to backend server');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ Backend not available - running in local mode');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from backend server');
      });

    } catch (error) {
      console.warn('⚠️ Backend not available - messages will be local only');
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      console.log('📤 Emitting event:', event, data);
      this.socket.emit(event, data);
    } else {
      console.error('❌ Socket not connected, cannot emit:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinRoom(roomId) {
    console.log('🚪 Joining room:', roomId);
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId) {
    console.log('🚪 Leaving room:', roomId);
    this.emit('leave_room', { roomId });
  }

  sendMessage(roomId, content, userId, userName, userAvatar) {
    console.log('💬 Sending message via socket:', { roomId, content, userId, userName });
    this.emit('send_message', {
      roomId,
      content,
      userId,
      userName,
      userAvatar,
      timestamp: new Date().toISOString()
    });
  }

  deleteMessage(roomId, messageId) {
    console.log('🗑️ Deleting message:', { roomId, messageId });
    this.emit('delete_message', { roomId, messageId });
  }

  clearChat(roomId) {
    console.log('🧹 Clearing chat:', roomId);
    this.emit('clear_chat', { roomId });
  }

  typing(roomId, userId, isTyping) {
    this.emit('typing', { roomId, userId, isTyping });
  }
}

export default new SocketService();