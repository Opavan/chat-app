import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import axios from 'axios';

const MessageInput = () => {
  const { currentRoom, sendMessage, setTyping } = useChatContext();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false); // 👈 NEW
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const emojis = [
    '😊', '😂', '❤️', '👍', '👎', '🎉', '🔥', '✨', '💯', '🚀',
    '😍', '😢', '😎', '🤔', '😴', '🤗', '😜', '🥳', '😇', '🤩',
    '👋', '👏', '🙏', '💪', '✌️', '🤝', '👌', '🎊', '🎁', '🌟'
  ];

  // 👇 NEW — AI handler
  const handleAiMessage = async (userQuestion) => {
    try {
      setIsAiLoading(true);

      // Send user's @ai message to chat first
      sendMessage(currentRoom, message.trim());
      setMessage('');

      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        message: userQuestion,
        chatHistory: [],
      });

      if (response.data.success) {
        // Send AI reply as a message in the room
        sendMessage(currentRoom, `🤖 AI: ${response.data.reply}`);
      }
   } catch (error) {
  const errData = error.response?.data?.error || error.message;
  console.error('AI Error:', errData);

  if (error.response?.status === 429) {
    sendMessage(currentRoom, '🤖 AI: Quota exceeded. Will be back tomorrow!');
  } else {
    sendMessage(currentRoom, '🤖 AI: Sorry, I could not respond right now.');
  }

  } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() || !currentRoom) return;

    //  NEW — Check if message starts with @ai
    if (message.trim().toLowerCase().startsWith('@ai ')) {
      const userQuestion = message.trim().slice(4); // Remove "@ai " prefix
      if (userQuestion) {
        handleAiMessage(userQuestion);
        return;
      }
    }

    // Normal message flow
    sendMessage(currentRoom, message.trim());
    setMessage('');
    setTyping(currentRoom, false);
    setIsTyping(false);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTyping(currentRoom, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(currentRoom, false);
    }, 1000);
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white">
      {/* 👇 NEW — AI hint text */}
      {message.startsWith('@') && !message.startsWith('@ai ') && (
        <div className="px-4 py-1 text-xs text-blue-500">
          💡 Tip: Type <strong>@ai </strong> followed by your question to ask AI
        </div>
      )}

      {/* 👇 NEW — AI loading indicator */}
      {isAiLoading && (
        <div className="px-4 py-1 text-xs text-purple-500 flex items-center gap-1">
          <span className="animate-pulse">🤖 AI is thinking...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>

        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-3 w-64 z-50">
              <div className="text-xs font-semibold text-gray-600 mb-2">Pick an emoji</div>
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl p-1 hover:bg-gray-100 rounded transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder={currentRoom ? "Type a message or @ai <question>..." : "Select a room first..."}
          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
            message.startsWith('@ai ')
              ? 'focus:ring-purple-500 border-purple-300'  //  purple when @ai mode
              : 'focus:ring-blue-500'
          }`}
          disabled={!currentRoom || isAiLoading}
        />

        <button
          type="submit"
          disabled={!message.trim() || !currentRoom || isAiLoading}
          className={`text-white p-2 rounded-lg transition disabled:cursor-not-allowed ${
            message.startsWith('@ai ')
              ? 'bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300' // 👈 purple send button
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
          }`}
        >
          {isAiLoading ? (
            <span className="w-5 h-5 block animate-spin">⏳</span>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;