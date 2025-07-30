
import React from 'react';
import TopNavbar from '../Navigation/TopNavbar';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const ProfileLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <TopNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ProfileHeader />
        <ProfileContent />
      </div>
    </div>
  );
};

export default ProfileLayout;
