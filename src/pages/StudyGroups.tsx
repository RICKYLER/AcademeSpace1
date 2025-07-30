
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import MobileStudyGroupsLayout from '../components/StudyGroups/MobileStudyGroupsLayout';

const StudyGroups: React.FC = () => {
  return (
    <ThemeProvider>
      <MobileStudyGroupsLayout />
    </ThemeProvider>
  );
};

export default StudyGroups;
