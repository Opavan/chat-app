import React from 'react';
import { ChatProvider, useChatContext } from './context/ChatContext';
import Login from './pages/Login';
import Chat from './pages/Chat';

const AppContent = () => {
  const { user } = useChatContext();
  
  return user ? <Chat /> : <Login />;
};

const App = () => {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
};

export default App;