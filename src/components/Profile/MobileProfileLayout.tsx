
import React from 'react';
import ResponsiveNavbar from '../Navigation/ResponsiveNavbar';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const MobileProfileLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <ResponsiveNavbar />
      
      <div className="px-2 md:px-4 py-3 md:py-6 pb-20 md:pb-6 max-w-6xl mx-auto">
        <ProfileHeader />
        <ProfileContent />
      </div>
    </div>
  );
};

export default MobileProfileLayout;
