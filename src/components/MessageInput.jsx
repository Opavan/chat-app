import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const MessageInput = () => {
  const { currentRoom, sendMessage, setTyping } = useChatContext();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const emojis = [
    '😊', '😂', '❤️', '👍', '👎', '🎉', '🔥', '✨', '💯', '🚀',
    '😍', '😢', '😎', '🤔', '😴', '🤗', '😜', '🥳', '😇', '🤩',
    '👋', '👏', '🙏', '💪', '✌️', '🤝', '👌', '🎊', '🎁', '🌟'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🔵 Submit clicked'); // DEBUG
    console.log('📝 Message:', message); // DEBUG
    console.log('🏠 Current Room:', currentRoom); // DEBUG
    
    if (message.trim() && currentRoom) {
      console.log('✅ Sending message...'); // DEBUG
      sendMessage(currentRoom, message.trim());
      setMessage('');
      setTyping(currentRoom, false);
      setIsTyping(false);
    } else {
      console.log('❌ Cannot send - message or room missing'); // DEBUG
    }
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

  // Close emoji picker when clicking outside
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

          {/* Emoji Picker Popup */}
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
          placeholder={currentRoom ? "Type a message..." : "Select a room first..."}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!currentRoom}
        />

        <button
          type="submit"
          disabled={!message.trim() || !currentRoom}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;