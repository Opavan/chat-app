import React, { useState } from 'react';
import { X, User, Bell, Moon, Globe, Lock, Palette, LogOut } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const ProfileSettings = ({ onClose }) => {
  const { user, logout } = useChatContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: '',
    bio: '',
    status: 'online'
  });

  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: false,
    language: 'en',
    messagePreview: true,
    readReceipts: true
  });

  // People avatars
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

  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const currentAvatar = user?.avatar;
    if (typeof currentAvatar === 'object') {
      return avatars.findIndex(a => a.emoji === currentAvatar.emoji) || 0;
    }
    return 0;
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSaveProfile = () => {
    // Update user profile logic here
    console.log('Saving profile:', formData);
    alert('Profile updated successfully!');
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const getUserAvatar = () => {
    if (typeof user?.avatar === 'object' && user?.avatar?.emoji) {
      return <span className="text-5xl">{user.avatar.emoji}</span>;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center font-bold shadow-lg"
                style={{ backgroundColor: getUserAvatarColor() }}
              >
                {getUserAvatar()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-blue-100">@{user?.name?.toLowerCase().replace(' ', '')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-500 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-500 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Avatar
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
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="online">🟢 Online</option>
                  <option value="away">🟡 Away</option>
                  <option value="busy">🔴 Busy</option>
                  <option value="offline">⚫ Offline</option>
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Enable Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={() => handleSettingToggle('notifications')}
                      className="w-5 h-5 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Sound Alerts</span>
                    <input
                      type="checkbox"
                      checked={settings.sound}
                      onChange={() => handleSettingToggle('sound')}
                      className="w-5 h-5 text-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Message Preview</span>
                    <input
                      type="checkbox"
                      checked={settings.messagePreview}
                      onChange={() => handleSettingToggle('messagePreview')}
                      className="w-5 h-5 text-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700 flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark Mode
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={() => handleSettingToggle('darkMode')}
                      className="w-5 h-5 text-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-700">Read Receipts</span>
                    <input
                      type="checkbox"
                      checked={settings.readReceipts}
                      onChange={() => handleSettingToggle('readReceipts')}
                      className="w-5 h-5 text-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Language */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language
                </h3>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Save Settings
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    onClose();
                  }
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;