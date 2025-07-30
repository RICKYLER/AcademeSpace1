
import React from 'react';
import ResponsiveNavbar from '../Navigation/ResponsiveNavbar';
import MessagesContent from './MessagesContent';

const MobileMessagesLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/5 dark:to-purple-900/5 transition-colors duration-300">
      <ResponsiveNavbar />
      
      <div className="p-3 md:p-6 pb-20 md:pb-6">
        <MessagesContent />
      </div>
    </div>
  );
};

export default MobileMessagesLayout;
