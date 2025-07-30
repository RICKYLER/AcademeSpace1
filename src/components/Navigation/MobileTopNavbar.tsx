
import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, MessageCircle, Users, Home, User, Plus, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useProfile } from '../../contexts/ProfileContext';
import { WalletConnect } from '../WalletConnect';
import NotificationDropdown from './NotificationDropdown';

const MobileTopNavbar: React.FC = () => {
  const { profileName, profileImage } = useProfile();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home', isActive: location.pathname === '/' },
    { path: '/messages', icon: MessageCircle, label: 'Chat', isActive: location.pathname === '/messages' },
    { path: '/create', icon: Plus, label: 'Create', isActive: location.pathname === '/create' },
    { path: '/study-groups', icon: Users, label: 'Groups', isActive: location.pathname === '/study-groups' },
    { path: '/profile', icon: User, label: 'Profile', isActive: location.pathname === '/profile' },
  ];

  const quickActions = [
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/algebrain', label: 'AlgebrAI Assistant', icon: Sparkles },
    { path: '/bookmarks', label: 'Saved Posts', icon: Plus },
    { path: '/wallet-demo', label: 'Wallet', icon: Plus },
  ];

  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '0';
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.body.style.paddingBottom = '80px';
      } else {
        document.body.style.paddingBottom = '0';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.paddingBottom = '0';
    };
  }, []);

  return (
    <>
      {/* Enhanced Main Mobile Navigation */}
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 md:hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo & Menu */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
              Academe
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
            <NotificationDropdown />
            <WalletConnect className="scale-90" />
          </div>
        </div>
      </nav>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 z-50 md:hidden shadow-lg">
        <div className="flex items-center justify-around py-2 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-3 px-3 min-w-0 flex-1 transition-all duration-300 rounded-xl ${
                item.isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                item.isActive 
                  ? 'bg-blue-100 dark:bg-blue-800/50 shadow-sm' 
                  : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
              }`}>
                <item.icon className={`w-5 h-5 ${
                  item.isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
              </div>
              <span className="text-xs font-medium mt-1 text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Enhanced Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarImage src={profileImage} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {profileName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{profileName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View your profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 w-full text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  <action.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md md:hidden">
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 mr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students, groups..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                autoFocus
              />
            </div>
          </div>
          <div className="p-6">
            <div className="text-center">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Start typing to search...</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Find students, study groups, and more</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopNavbar;
