
import React from 'react';
import TopNavbar from '../Navigation/TopNavbar';
import LeftSidebar from '../Sidebar/LeftSidebar';
import FeaturedProducts from '../Feed/FeaturedProducts';
import NewsFeed from '../Feed/NewsFeed';
import PerformancePanel from '../Stats/PerformancePanel';
import SponsoredAds from '../Ads/SponsoredAds';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <TopNavbar />
      
      <div className="flex">
        <LeftSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <FeaturedProducts />
            <NewsFeed />
          </div>
        </main>
        
        {/* Right Sidebar */}
        <aside className="w-80 p-6 space-y-6">
          <PerformancePanel />
          <SponsoredAds />
        </aside>
      </div>
    </div>
  );
};

export default MainLayout;
