import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useBookmarks } from '../../contexts/BookmarkContext';
import ShareModal from './ShareModal';

interface Comment {
  id: number;
  author: string;
  content: string;
  time: string;
  avatar: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: Comment[];
  shares: number;
  type: string;
  isLiked: boolean;
}

const initialPosts: Post[] = [
  {
    id: 1,
    author: 'Study Tips Central',
    avatar: '📚',
    time: '2h',
    content: 'Master the Pomodoro Technique: 25 minutes focused study + 5 minute break. After 4 cycles, take a 30-minute break. This method can improve your concentration by up to 40%!',
    likes: 234,
    comments: [
      {
        id: 1,
        author: 'Sarah M.',
        content: 'This technique really works! Been using it for weeks now.',
        time: '1h',
        avatar: '👩'
      }
    ],
    shares: 12,
    type: 'tip',
    isLiked: false
  },
  {
    id: 2,
    author: 'MIT Hackathon 2024',
    avatar: '🏆',
    time: '4h',
    content: 'Registration is now OPEN for MIT\'s biggest hackathon! 💻 Win $50,000 in prizes, network with tech leaders, and build the next big thing. Limited spots available!',
    likes: 892,
    comments: [],
    shares: 203,
    type: 'event',
    isLiked: false
  },
  {
    id: 3,
    author: 'Sarah Chen',
    avatar: '👩‍💻',
    time: '6h',
    content: 'Just discovered this amazing study spot at the university library - Level 3 has the perfect ambient noise and natural lighting. Perfect for deep focus sessions! 📖✨',
    likes: 127,
    comments: [
      {
        id: 2,
        author: 'Mike T.',
        content: 'Thanks for sharing! I need to check this out.',
        time: '30m',
        avatar: '👨'
      }
    ],
    shares: 8,
    type: 'location',
    isLiked: false
  }
];

const NewsFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const handleLike = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked
            }
          : post
      )
    );

    toast({
      description: posts.find(p => p.id === postId)?.isLiked 
        ? "Removed like" 
        : "Post liked!",
      duration: 2000,
    });
  };

  const handleBookmark = (post: Post) => {
    if (isBookmarked(post.id)) {
      removeBookmark(post.id);
      toast({
        description: "Bookmark removed",
        duration: 2000,
      });
    } else {
      addBookmark(post);
      toast({
        description: "Post bookmarked!",
        duration: 2000,
      });
    }
  };

  const handleShare = (postId: number, message?: string, recipients?: string[]) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      )
    );

    // Simulate real-time sharing by adding a new post if sharing publicly
    if (!recipients || recipients.length === 0) {
      const originalPost = posts.find(p => p.id === postId);
      if (originalPost) {
        const sharedPost: Post = {
          id: Date.now(),
          author: 'You',
          avatar: '😊',
          time: 'now',
          content: message ? 
            `${message}\n\n--- Shared from ${originalPost.author} ---\n${originalPost.content}` :
            `--- Shared from ${originalPost.author} ---\n${originalPost.content}`,
          likes: 0,
          comments: [],
          shares: 0,
          type: 'shared',
          isLiked: false
        };
        
        setPosts(prevPosts => [sharedPost, ...prevPosts]);
      }
    }
  };

  const openShareModal = (post: Post) => {
    setSelectedPost(post);
    setShareModalOpen(true);
  };

  const handleComment = (postId: number) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    const newComment: Comment = {
      id: Date.now(),
      author: 'You',
      content: commentText,
      time: 'now',
      avatar: '😊'
    };

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, newComment]
            }
          : post
      )
    );

    setNewComments(prev => ({ ...prev, [postId]: '' }));
    
    toast({
      description: "Comment added!",
      duration: 2000,
    });
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId: number, value: string) => {
    setNewComments(prev => ({ ...prev, [postId]: value }));
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
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
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  post.isLiked 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes}</span>
              </button>
              
              <button 
                onClick={() => toggleComments(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments.length}</span>
              </button>
              
              <button 
                onClick={() => openShareModal(post)}
                className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">{post.shares}</span>
              </button>
            </div>
            
            <button 
              onClick={() => handleBookmark(post)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${
                isBookmarked(post.id) 
                  ? 'text-blue-500 dark:text-blue-400 fill-current' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </button>
          </div>

          {/* Comments Section */}
          {showComments[post.id] && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {/* Existing Comments */}
              <div className="space-y-3 mb-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-sm">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.time} ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-sm">
                  😊
                </div>
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComments[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleComment(post.id);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleComment(post.id)}
                    size="sm"
                    disabled={!newComments[post.id]?.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        post={selectedPost}
        onShare={handleShare}
      />
    </div>
  );
};

export default NewsFeed;
