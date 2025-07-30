
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import MobileProfileLayout from '../components/Profile/MobileProfileLayout';

const Profile: React.FC = () => {
  return (
    <ThemeProvider>
      <MobileProfileLayout />
    </ThemeProvider>
  );
};

export default Profile;
