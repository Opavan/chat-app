import React, { useEffect, useRef, useState } from 'react';
import { Users, LogOut, Settings, Trash2 } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import ChatList from '../components/ChatList';
import Message from '../components/Message';
import MessageInput from '../components/MessageInput';
import OnlineUsers from '../components/OnlineUsers';
import ProfileSettings from '../components/ProfileSettings';

const Chat = () => {
  const { user, currentRoom, rooms, messages, logout, clearChat } = useChatContext();
  const messagesEndRef = useRef(null);

  const [showUsers, setShowUsers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const roomData = rooms.find(r => r.id === currentRoom);
  const roomMessages = messages[currentRoom] || [];

  // DEBUG: Log messages state
  console.log('🐛 DEBUG - Current Room:', currentRoom);
  console.log('🐛 DEBUG - All Messages:', messages);
  console.log('🐛 DEBUG - Room Messages:', roomMessages);
  console.log('🐛 DEBUG - Room Messages Length:', roomMessages.length);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  // Helper function for user avatar
  const getUserAvatar = () => {
    if (typeof user?.avatar === 'object' && user?.avatar?.emoji) {
      return <span className="text-3xl">{user.avatar.emoji}</span>;
    }
    return user?.name?.charAt(0).toUpperCase();
  };

  const getUserAvatarColor = () => {
    if (typeof user?.avatar === 'object') {
      return user?.avatar?.color || '#6B7280';
    }
    return user?.avatar || '#6B7280';
  };

  return (
    <div className="h-screen flex bg-gray-100">

      {/* LEFT SIDEBAR */}
      <div className="hidden lg:flex w-64 bg-gray-50 shadow-sm flex-col">

        {/* USER HEADER */}
        <div className="p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover:ring-2 hover:ring-blue-500 transition"
              style={{ backgroundColor: getUserAvatarColor() }}
            >
              {getUserAvatar()}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {user?.name}
              </h3>
              <p className="text-xs text-green-500">Online</p>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* CHAT LIST */}
        <ChatList />
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            {roomData?.avatar && (
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {roomData.avatar}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-800">
                {roomData?.name || 'Select a room'}
              </h2>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Clear Chat Button */}
            {currentRoom && (
              <button
                onClick={() => clearChat(currentRoom)}
                className="p-2 hover:bg-red-50 rounded-lg transition"
                title="Clear Chat"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>
            )}

            <button
              onClick={() => setShowUsers(!showUsers)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Online Users"
            >
              <Users size={20} />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Profile & Settings"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto bg-[#f5f7fb] p-4">
          {roomMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-semibold mb-2">No messages yet</p>
                <p className="text-sm">Be the first to start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {console.log('🎨 RENDERING MESSAGES:', roomMessages)}
              {roomMessages.map((msg, index) => {
                console.log('🎨 Rendering message:', index, msg);
                return (
                  <Message
                    key={msg.id || index}
                    message={msg}
                    isOwn={msg.userId === user.id}
                  />
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* MESSAGE INPUT */}
        <div className="bg-white p-3 shadow-inner">
          <MessageInput />
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden lg:flex w-64 bg-gray-50 shadow-sm">
        <OnlineUsers />
      </div>

      {/* Profile & Settings Modal */}
      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Chat;