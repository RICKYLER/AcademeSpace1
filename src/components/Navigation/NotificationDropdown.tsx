
import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageCircle, Users, Award, X, Settings } from 'lucide-react';

interface UserNotification {
  id: string;
  category: 'ai-assistant' | 'study-groups' | 'achievements';
  title: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
  icon: React.ReactNode;
}

const NotificationDropdown: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([
    {
      id: '1',
      category: 'ai-assistant',
      title: 'New AI Solution Available',
      message: 'AlgebrAI has generated a new solution for your calculus problem set.',
      timeAgo: '2 minutes ago',
      isUnread: true,
      icon: <MessageCircle className="w-4 h-4 text-blue-500" />
    },
    {
      id: '2',
      category: 'study-groups',
      title: 'Study Group Invitation',
      message: 'Sarah invited you to join the "Advanced Physics" study group.',
      timeAgo: '15 minutes ago',
      isUnread: true,
      icon: <Users className="w-4 h-4 text-green-500" />
    },
    {
      id: '3',
      category: 'achievements',
      title: 'Achievement Unlocked',
      message: 'You earned the "Knowledge Seeker" NFT badge for completing 10 courses.',
      timeAgo: '1 hour ago',
      isUnread: false,
      icon: <Award className="w-4 h-4 text-purple-500" />
    },
    {
      id: '4',
      category: 'ai-assistant',
      title: 'Weekly Progress Report',
      message: 'Your learning progress summary is ready to view.',
      timeAgo: '3 hours ago',
      isUnread: false,
      icon: <MessageCircle className="w-4 h-4 text-blue-500" />
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadNotificationsCount = userNotifications.filter(notification => notification.isUnread).length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markNotificationAsRead = (notificationId: string) => {
    setUserNotifications(previousNotifications => 
      previousNotifications.map(notification => 
        notification.id === notificationId ? { ...notification, isUnread: false } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setUserNotifications(previousNotifications => 
      previousNotifications.map(notification => ({ ...notification, isUnread: false }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setUserNotifications(previousNotifications => 
      previousNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'ai-assistant': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'study-groups': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'achievements': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden backdrop-blur-md">
          {/* Notification Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Notification settings"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {userNotifications.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-4 border-l-4 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer group ${
                    notification.isUnread 
                      ? `${getCategoryStyles(notification.category)} border-l-blue-500` 
                      : 'bg-white dark:bg-gray-900 border-l-transparent hover:border-l-gray-300 dark:hover:border-l-gray-600'
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notification.isUnread 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            notification.isUnread 
                              ? 'text-gray-600 dark:text-gray-300' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center space-x-2">
                            <span>{notification.timeAgo}</span>
                            <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">
                              {notification.category.replace('-', ' ')}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                          aria-label="Remove notification"
                        >
                          <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
