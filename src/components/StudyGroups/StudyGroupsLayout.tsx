
import React from 'react';
import TopNavbar from '../Navigation/TopNavbar';
import LeftSidebar from '../Sidebar/LeftSidebar';
import StudyGroupsContent from './StudyGroupsContent';

const StudyGroupsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <TopNavbar />
      
      <div className="flex">
        <LeftSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <StudyGroupsContent />
        </main>
      </div>
    </div>
  );
};

export default StudyGroupsLayout;
