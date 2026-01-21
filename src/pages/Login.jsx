import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';

const Login = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const { login } = useChatContext();

  // People avatars with their colors
  const avatars = [
    { emoji: '👨‍💼', color: '#3B82F6', label: 'Business Man' },
    { emoji: '👩‍💼', color: '#8B5CF6', label: 'Business Woman' },
    { emoji: '👨‍💻', color: '#10B981', label: 'Developer' },
    { emoji: '👩‍💻', color: '#EC4899', label: 'Developer Woman' },
    { emoji: '👨‍🎨', color: '#F59E0B', label: 'Artist' },
    { emoji: '👩‍🎨', color: '#EF4444', label: 'Artist Woman' },
    { emoji: '👨‍🔬', color: '#6366F1', label: 'Scientist' },
    { emoji: '👩‍🔬', color: '#14B8A6', label: 'Scientist Woman' },
    { emoji: '👨‍🏫', color: '#8B5CF6', label: 'Teacher' },
    { emoji: '👩‍🏫', color: '#F472B6', label: 'Teacher Woman' },
    { emoji: '👨‍⚕️', color: '#10B981', label: 'Doctor' },
    { emoji: '👩‍⚕️', color: '#06B6D4', label: 'Doctor Woman' },
    { emoji: '👨‍🚀', color: '#6366F1', label: 'Astronaut' },
    { emoji: '👩‍🚀', color: '#A855F7', label: 'Astronaut Woman' },
    { emoji: '👨‍🎤', color: '#EF4444', label: 'Singer' },
    { emoji: '👩‍🎤', color: '#EC4899', label: 'Singer Woman' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      // Store both emoji and color
      const avatarData = {
        emoji: avatars[selectedAvatar].emoji,
        color: avatars[selectedAvatar].color
      };
      login(name.trim(), avatarData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ChatApp
          </h1>
          <p className="text-gray-600">Connect with friends in real-time</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(index)}
                  title={avatar.label}
                  className={`h-16 rounded-xl transition transform hover:scale-110 ${
                    selectedAvatar === index
                      ? 'ring-4 ring-blue-500 ring-offset-2'
                      : 'hover:ring-2 hover:ring-gray-300'
                  } flex items-center justify-center text-4xl bg-gray-50 hover:bg-gray-100`}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Selected: {avatars[selectedAvatar].label}
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            Start Chatting
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Join the conversation now!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;