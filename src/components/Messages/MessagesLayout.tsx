
import React from 'react';
import TopNavbar from '../Navigation/TopNavbar';
import LeftSidebar from '../Sidebar/LeftSidebar';
import MessagesContent from './MessagesContent';

const MessagesLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <TopNavbar />
      
      <div className="flex">
        <LeftSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <MessagesContent />
        </main>
      </div>
    </div>
  );
};

export default MessagesLayout;
