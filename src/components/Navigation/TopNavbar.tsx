
import React from 'react';
import { Search, Bell, Settings, User, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useEthereumWallet } from '../../hooks/useEthereumWallet';
import { useProfile } from '../../contexts/ProfileContext';
import ThemeToggle from '../ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import '../ThemeToggle.css';

const TopNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { profileName } = useProfile();
  const {
    account,
    balance,
    connectWallet,
    disconnectWallet,
    isConnecting
  } = useEthereumWallet();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300">
            Academe Space
          </Link>
          <div className="hidden lg:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Welcome, {profileName.split(' ')[0]}!
            </span>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
            <input 
              type="text" 
              placeholder="Search students, study groups, or topics..." 
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 hover:bg-white dark:hover:bg-gray-800" 
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-3">
          {/* Enhanced Wallet Connection */}
          <div className="flex items-center space-x-2">
            {account ? (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-2.5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-sm hidden md:block">
                    <div className="font-semibold text-green-700 dark:text-green-300">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-xs">
                      {balance} ETH
                    </div>
                  </div>
                </div>
                <button 
                  onClick={disconnectWallet} 
                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors hidden md:inline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                disabled={isConnecting} 
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm hidden md:inline">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </button>
            )}
          </div>

          {/* Enhanced Navigation Icons */}
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            
            <Link 
              to="/profile" 
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
            >
              <User className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </Link>

            {/* Enhanced Theme Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 transition-all duration-300">
              <ThemeToggle 
                isDark={theme === 'dark'} 
                onToggle={toggleTheme} 
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
