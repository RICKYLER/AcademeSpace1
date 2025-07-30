
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Users, BookOpen, MessageCircle, Heart, Award, FileText } from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const activities = [
    {
      type: 'study_group',
      title: 'Joined "Advanced Data Structures Study Group"',
      description: 'Connected with 12 other CS students',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      type: 'achievement',
      title: 'Completed Machine Learning Certification',
      description: 'Stanford Online Course with distinction',
      time: '1 day ago',
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      type: 'post',
      title: 'Shared comprehensive notes on Database Design',
      description: 'Helped 45+ students with SQL optimization',
      time: '2 days ago',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      type: 'interaction',
      title: 'Liked Sarah\'s post about React best practices',
      description: 'Found the component optimization tips really helpful',
      time: '3 days ago',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      type: 'study_group',
      title: 'Created "Python for Data Science" study group',
      description: '8 members joined in the first week',
      time: '5 days ago',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      type: 'discussion',
      title: 'Started discussion on Algorithms complexity',
      description: 'Big O notation best practices and examples',
      time: '1 week ago',
      icon: MessageCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      type: 'resource',
      title: 'Shared resource: "Clean Code" study guide',
      description: 'Comprehensive notes from Robert Martin\'s book',
      time: '1 week ago',
      icon: BookOpen,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:pb-0">
              <div className={`p-2 rounded-lg ${activity.bgColor} shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-medium leading-snug">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
