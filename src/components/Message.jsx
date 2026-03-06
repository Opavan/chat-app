import React, { useState } from 'react';
import { Trash2, MoreVertical } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import axios from 'axios';

const QUICK_REPLIES = [' Sounds good!', ' Let me check', ' Done!', ' Thanks!'];

const Message = ({ message, isOwn, isLast }) => {
  const { deleteMessage, currentRoom, sendMessage } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(currentRoom, message.id);
    }
    setShowMenu(false);
  };

  const fetchSmartReplies = async () => {
    if (smartReplies.length > 0) {
      setSmartReplies([]);
      return;
    }
    try {
      setLoadingReplies(true);
      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        message: `Given this chat message: "${message.content}", suggest exactly 3 very short reply options (max 5 words each). Return only a JSON array of strings, nothing else. Example: ["Sounds good!", "Let me check", "Thanks!"]`,
        chatHistory: [],
      });

      if (response.data.success) {
        const text = response.data.reply.trim();
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
          const replies = JSON.parse(jsonMatch[0]);
          setSmartReplies(replies.slice(0, 3));
        } else {
          setSmartReplies(QUICK_REPLIES.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Smart reply error:', error);
      setSmartReplies(QUICK_REPLIES.slice(0, 3));
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleQuickReply = (reply) => {
    sendMessage(currentRoom, reply);
    setSmartReplies([]);
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

  // Read receipt status
  const readCount = (message.readBy || []).length;

  return (
    <div className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}>

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
            <div className={`rounded-2xl overflow-hidden ${
              message.type === 'image' ? '' : `px-4 py-2 ${
                isOwn
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : 'bg-gray-200 text-gray-800 rounded-tl-sm'
              }`
            }`}>
              {message.type === 'image' ? (
                <img
                  src={message.content}
                  alt="shared image"
                  className="max-w-xs max-h-64 rounded-2xl cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(message.content, '_blank')}
                />
              ) : (
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {/* Delete Button */}
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

          {/* Timestamp + Read Receipt */}
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-gray-400">
              {formatTime(message.timestamp)}
            </span>

            {/*  Read receipts — only on own messages */}
            {isOwn && (
              <span className="text-xs leading-none">
                {readCount > 0 ? (
                  <span className="text-blue-500 font-bold" title="Read">✓✓</span>
                ) : (
                  <span className="text-gray-400" title="Sent">✓</span>
                )}
              </span>
            )}

            {/* Smart Reply Button */}
            {!isOwn && isLast && (
              <button
                onClick={fetchSmartReplies}
                className="text-xs text-blue-400 hover:text-blue-600 transition ml-1"
                title="Get smart reply suggestions"
              >
                {loadingReplies ? '...' : '💬 Reply'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Reply Buttons */}
      {!isOwn && smartReplies.length > 0 && (
        <div className="flex gap-2 mt-2 ml-14 flex-wrap">
          {smartReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="text-xs px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded-full hover:bg-blue-50 transition shadow-sm"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;