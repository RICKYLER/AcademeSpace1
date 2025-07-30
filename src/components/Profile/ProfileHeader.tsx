
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MapPin, Calendar, BookOpen, Edit3 } from 'lucide-react';
import ProfileEditDialog from './ProfileEditDialog';
import { useProfile } from '../../contexts/ProfileContext';

const ProfileHeader: React.FC = () => {
  const { profileName, profileImage } = useProfile();

  return (
    <Card className="mb-4 md:mb-6 overflow-hidden">
      <CardContent className="p-0">
        {/* Cover Photo */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <div className="absolute top-3 md:top-4 right-3 md:right-4">
            <ProfileEditDialog />
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="flex flex-col space-y-4 -mt-12 md:-mt-16">
            {/* Avatar */}
            <div className="flex items-end justify-between">
              <Avatar className="w-20 h-20 md:w-32 md:h-32 border-4 border-white dark:border-gray-800">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback className="text-lg md:text-2xl bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                  {profileName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Mobile Edit Button */}
              <div className="md:hidden">
                <button className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </div>
            </div>
            
            {/* Name and Basic Info */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {profileName}
                </h1>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                  Computer Science Student
                </p>
              </div>
              
              {/* Stats - Horizontal scroll on mobile */}
              <div className="flex space-x-6 overflow-x-auto pb-2">
                <div className="text-center min-w-0 flex-shrink-0">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">247</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Connections</div>
                </div>
                <div className="text-center min-w-0 flex-shrink-0">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">3.2k</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Study Points</div>
                </div>
                <div className="text-center min-w-0 flex-shrink-0">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">18</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Achievements</div>
                </div>
              </div>
              
              {/* Quick Info - Stack on mobile */}
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Joined January 2023</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Stanford Class of 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
