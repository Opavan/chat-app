import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const ChatList = () => {
  const { currentRoom, joinRoom, rooms } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Search */}
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">
            CHANNELS
          </div>
          {filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => joinRoom(room.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
                currentRoom === room.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-2xl">{room.avatar}</span>
              <span className="flex-1 text-left font-medium">{room.name}</span>
              {room.unread > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentRoom === room.id
                    ? 'bg-white text-blue-500'
                    : 'bg-blue-500 text-white'
                }`}>
                  {room.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;