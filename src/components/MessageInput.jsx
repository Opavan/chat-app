import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import axios from 'axios';

const MessageInput = () => {
  const { currentRoom, sendMessage, setTyping } = useChatContext();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);  
  const [imageBase64, setImageBase64] = useState(null);   
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = [
    '😊', '😂', '❤️', '👍', '👎', '🎉', '🔥', '✨', '💯', '🚀',
    '😍', '😢', '😎', '🤔', '😴', '🤗', '😜', '🥳', '😇', '🤩',
    '👋', '👏', '🙏', '💪', '✌️', '🤝', '👌', '🎊', '🎁', '🌟'
  ];

  const handleAiMessage = async (userQuestion) => {
    try {
      setIsAiLoading(true);
      sendMessage(currentRoom, message.trim());
      setMessage('');

      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        message: userQuestion,
        chatHistory: [],
      });

      if (response.data.success) {
        sendMessage(currentRoom, ` AI: ${response.data.reply}`);
      }
    } catch (error) {
      const errData = error.response?.data?.error || error.message;
      console.error('AI Error:', errData);
      if (error.response?.status === 429) {
        sendMessage(currentRoom, ' AI: Quota exceeded. Will be back tomorrow!');
      } else {
        sendMessage(currentRoom, ' AI: Sorry, I could not respond right now.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();


    if (imageBase64) {
      sendMessage(currentRoom, imageBase64, 'image');
      setImagePreview(null);
      setImageBase64(null);
      return;
    }

    if (!message.trim() || !currentRoom) return;

    if (message.trim().toLowerCase().startsWith('@ai ')) {
      const userQuestion = message.trim().slice(4);
      if (userQuestion) {
        handleAiMessage(userQuestion);
        return;
      }
    }

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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(currentRoom, false);
    }, 1000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large! Max size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImagePreview(URL.createObjectURL(file)); 
      setImageBase64(base64); 
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const cancelImage = () => {
    setImagePreview(null);
    setImageBase64(null);
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
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-white">

      {/*  NEW — Image Preview Bar */}
      {imagePreview && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-t border-blue-100">
          <img
            src={imagePreview}
            alt="preview"
            className="w-16 h-16 object-cover rounded-lg border"
          />
          <div className="flex-1">
            <p className="text-xs text-blue-600 font-medium">Image ready to send</p>
            <p className="text-xs text-gray-400">Click send to share</p>
          </div>
          <button
            onClick={cancelImage}
            className="p-1 hover:bg-blue-100 rounded-full transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* AI hint */}
      {message.startsWith('@') && !message.startsWith('@ai ') && (
        <div className="px-4 py-1 text-xs text-blue-500">
           Tip: Type <strong>@ai </strong> followed by your question to ask AI
        </div>
      )}

      {/* AI loading indicator */}
      {isAiLoading && (
        <div className="px-4 py-1 text-xs text-purple-500 flex items-center gap-1">
          <span className="animate-pulse">AI is thinking...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Paperclip button */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          disabled={!currentRoom || isAiLoading}
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>

        {/* Emoji picker */}
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

        {/* Text input */}
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder={
            imagePreview
              ? 'Click send to share image...'
              : currentRoom
              ? 'Type a message or @ai <question>...'
              : 'Select a room first...'
          }
          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
            message.startsWith('@ai ')
              ? 'focus:ring-purple-500 border-purple-300'
              : 'focus:ring-blue-500'
          }`}
          disabled={!currentRoom || isAiLoading || !!imagePreview}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !imageBase64) || !currentRoom || isAiLoading}
          className={`text-white p-2 rounded-lg transition disabled:cursor-not-allowed ${
            imagePreview
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-300'
              : message.startsWith('@ai ')
              ? 'bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300'
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