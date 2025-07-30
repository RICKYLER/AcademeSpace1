
import React from 'react';
import AboutSection from './AboutSection';
import AcademicInfo from './AcademicInfo';
import SkillsSection from './SkillsSection';
import AchievementsSection from './AchievementsSection';
import ActivityFeed from './ActivityFeed';

const ProfileContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <AboutSection />
        <AcademicInfo />
        <ActivityFeed />
      </div>
      
      {/* Right Column */}
      <div className="space-y-6">
        <SkillsSection />
        <AchievementsSection />
      </div>
    </div>
  );
};

export default ProfileContent;
