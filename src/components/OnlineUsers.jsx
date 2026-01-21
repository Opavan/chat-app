import React from 'react';
import { Circle } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const OnlineUsers = () => {
  const { onlineUsers, user } = useChatContext();

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const allUsers = user ? [user, ...onlineUsers.filter(u => u.id !== user.id)] : onlineUsers;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-gray-800">Online Users</h3>
        <p className="text-xs text-gray-500">{allUsers.length} members</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {allUsers.map(u => {
          const avatarEmoji = typeof u.avatar === 'object' ? u.avatar?.emoji : null;
          const avatarColor = typeof u.avatar === 'object' ? u.avatar?.color : u.avatar;

          return (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition mb-1"
            >
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                  style={{ backgroundColor: avatarColor || '#6B7280' }}
                >
                  {avatarEmoji ? (
                    <span className="text-2xl">{avatarEmoji}</span>
                  ) : (
                    getInitials(u.name)
                  )}
                </div>
                <Circle
                  className={`absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full ${getStatusColor(u.status)}`}
                  fill="currentColor"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {u.name} {u.id === user?.id && '(You)'}
                </div>
                <div className="text-xs text-gray-500 capitalize">{u.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsers;