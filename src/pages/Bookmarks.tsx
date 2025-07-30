
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ResponsiveNavbar from '../components/Navigation/ResponsiveNavbar';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import { useBookmarks } from '../contexts/BookmarkContext';
import { Heart, MessageCircle, Share2, Bookmark as BookmarkIcon, MoreHorizontal } from 'lucide-react';

const Bookmarks: React.FC = () => {
  const { bookmarkedPosts, removeBookmark } = useBookmarks();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <ResponsiveNavbar />
        
        <div className="flex">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden md:block">
            <LeftSidebar />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 p-3 md:p-6 pb-20 md:pb-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Bookmarks
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {bookmarkedPosts.length} saved posts
                </p>
              </div>

              {bookmarkedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No bookmarks yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start bookmarking posts to see them here!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookmarkedPosts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg">
                            {post.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {post.author}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {post.time} ago
                            </p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">{post.likes}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments.length}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm">{post.shares}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => removeBookmark(post.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                          <BookmarkIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Bookmarks;
