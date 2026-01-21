import React, { useState } from 'react';
import { Trash2, MoreVertical } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const Message = ({ message, isOwn }) => {
  const { deleteMessage, currentRoom } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(currentRoom, message.id);
    }
    setShowMenu(false);
  };

  if (message.userId === 0) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  const avatarEmoji = typeof message.userAvatar === 'object' 
    ? message.userAvatar?.emoji 
    : null;
  
  const avatarColor = typeof message.userAvatar === 'object'
    ? message.userAvatar?.color
    : message.userAvatar;

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className={`flex gap-3 mb-4 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
        style={{ backgroundColor: avatarColor || '#6B7280' }}
      >
        {avatarEmoji ? (
          <span className="text-2xl">{avatarEmoji}</span>
        ) : (
          getInitials(message.userName)
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs md:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs font-semibold text-gray-600 mb-1 px-1">
            {message.userName}
          </span>
        )}
        <div className="relative">
          <div className={`px-4 py-2 rounded-2xl ${
  isOwn
    ? 'bg-blue-500 text-white rounded-tr-sm'
    : 'bg-gray-200 text-gray-800 rounded-tl-sm'
}`}>
  <p className="break-words whitespace-pre-wrap">{message.content}</p>
</div>


          
          {/* Delete Button - Only show for own messages */}
          {isOwn && (
            <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-10">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default Message;