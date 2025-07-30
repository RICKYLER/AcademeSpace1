
import React from 'react';
import ResponsiveNavbar from '../Navigation/ResponsiveNavbar';
import LeftSidebar from '../Sidebar/LeftSidebar';
import FeaturedProducts from '../Feed/FeaturedProducts';
import NewsFeed from '../Feed/NewsFeed';
import PerformancePanel from '../Stats/PerformancePanel';
import SponsoredAds from '../Ads/SponsoredAds';

const ResponsiveLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-all duration-500">
      <ResponsiveNavbar />
      
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <LeftSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Enhanced content container */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-1">
              <FeaturedProducts />
            </div>
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-1">
              <NewsFeed />
            </div>
          </div>
        </main>
        
        {/* Right Sidebar - Hidden on mobile and tablet */}
        <aside className="hidden xl:block w-80 p-6 space-y-6">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-1">
            <PerformancePanel />
          </div>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-1">
            <SponsoredAds />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
