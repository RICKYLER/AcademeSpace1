
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Star, Medal, Award, BookOpen, Users } from 'lucide-react';

const AchievementsSection: React.FC = () => {
  const achievements = [
    {
      title: 'Dean\'s List Excellence',
      description: 'Maintained GPA above 3.8 for 4 consecutive semesters',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: 'Hackathon Champion',
      description: 'First place at University Innovation Challenge 2024',
      icon: Star,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Research Contributor',
      description: 'Co-authored paper on Machine Learning Applications',
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Peer Mentor Award',
      description: 'Recognized for outstanding student mentorship',
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Study Group Leader',
      description: 'Successfully organized 15+ collaborative study sessions',
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Academic Excellence',
      description: 'Graduated Magna Cum Laude with honors',
      icon: Medal,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5" />
          <span>Academic Achievements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className={`p-2 rounded-lg ${achievement.bgColor} shrink-0`}>
                <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsSection;
