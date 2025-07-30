
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import MobileMessagesLayout from '../components/Messages/MobileMessagesLayout';

const Messages: React.FC = () => {
  return (
    <ThemeProvider>
      <MobileMessagesLayout />
    </ThemeProvider>
  );
};

export default Messages;
