
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Post {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: any[];
  shares: number;
  type: string;
  isLiked: boolean;
}

interface BookmarkContextType {
  bookmarkedPosts: Post[];
  addBookmark: (post: Post) => void;
  removeBookmark: (postId: number) => void;
  isBookmarked: (postId: number) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);

  const addBookmark = (post: Post) => {
    setBookmarkedPosts(prev => {
      if (prev.some(p => p.id === post.id)) return prev;
      return [...prev, post];
    });
  };

  const removeBookmark = (postId: number) => {
    setBookmarkedPosts(prev => prev.filter(post => post.id !== postId));
  };

  const isBookmarked = (postId: number) => {
    return bookmarkedPosts.some(post => post.id === postId);
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarkedPosts,
      addBookmark,
      removeBookmark,
      isBookmarked
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
