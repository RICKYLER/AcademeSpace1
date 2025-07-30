
import React from 'react';
import TopNavbar from './TopNavbar';
import MobileTopNavbar from './MobileTopNavbar';

const ResponsiveNavbar: React.FC = () => {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <TopNavbar />
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileTopNavbar />
      </div>
    </>
  );
};

export default ResponsiveNavbar;
