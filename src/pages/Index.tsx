
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';

const Index: React.FC = () => {
  return (
    <ThemeProvider>
      <ResponsiveLayout />
    </ThemeProvider>
  );
};

export default Index;
