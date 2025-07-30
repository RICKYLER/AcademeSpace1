
import React from 'react';
import ResponsiveNavbar from '../Navigation/ResponsiveNavbar';
import LeftSidebar from '../Sidebar/LeftSidebar';
import StudyGroupsContent from './StudyGroupsContent';

const MobileStudyGroupsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <ResponsiveNavbar />
      
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <LeftSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 pb-20 md:pb-6">
          <StudyGroupsContent />
        </main>
      </div>
    </div>
  );
};

export default MobileStudyGroupsLayout;
