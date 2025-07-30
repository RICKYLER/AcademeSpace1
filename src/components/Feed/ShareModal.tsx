
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Send, Link, MessageCircle, X, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onShare: (postId: number, message?: string, recipients?: string[]) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post, onShare }) => {
  const [shareMessage, setShareMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [shareType, setShareType] = useState<'public' | 'direct' | 'link' | 'message'>('public');
  const { toast } = useToast();

  // Mock contacts for demonstration (including messaging contacts)
  const contacts = [
    { id: '1', name: 'Sarah Chen', avatar: '👩‍💻', online: true, type: 'contact' },
    { id: '2', name: 'Mike Thompson', avatar: '👨‍🔬', online: true, type: 'contact' },
    { id: '3', name: 'Emma Davis', avatar: '👩‍🎨', online: false, type: 'contact' },
    { id: '4', name: 'Alex Johnson', avatar: '👨‍💼', online: true, type: 'contact' },
  ];

  // Messaging conversations
  const conversations = [
    { id: 'msg-1', name: 'Sarah Chen', avatar: 'SC', online: true, type: 'conversation' },
    { id: 'msg-2', name: 'Study Group - CS101', avatar: 'SG', online: false, type: 'conversation' },
    { id: 'msg-3', name: 'Alex Rodriguez', avatar: 'AR', online: true, type: 'conversation' },
    { id: 'msg-4', name: 'Emma Thompson', avatar: 'ET', online: false, type: 'conversation' },
  ];

  const allRecipients = shareType === 'message' ? conversations : contacts;

  const handleShare = () => {
    if (!post) return;

    if ((shareType === 'direct' || shareType === 'message') && selectedRecipients.length === 0) {
      toast({
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    onShare(post.id, shareMessage, selectedRecipients);
    
    // Handle message sharing specifically
    if (shareType === 'message') {
      // Simulate sending to messaging system
      const messageData = {
        postId: post.id,
        postData: {
          id: post.id,
          author: post.author,
          content: post.content,
          avatar: post.avatar
        },
        message: shareMessage.trim() || `Check out this post from ${post.author}`,
        recipients: selectedRecipients
      };
      
      // Store in localStorage to simulate real-time messaging
      const existingShares = JSON.parse(localStorage.getItem('sharedPosts') || '[]');
      existingShares.push({
        ...messageData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('sharedPosts', JSON.stringify(existingShares));
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('postShared', { detail: messageData }));
    }

    // Reset form
    setShareMessage('');
    setSelectedRecipients([]);
    setShareType('public');
    onClose();

    // Show success message based on share type
    const message = shareType === 'link' 
      ? "Link copied to clipboard!" 
      : shareType === 'message'
        ? `Post shared to ${selectedRecipients.length} conversation${selectedRecipients.length === 1 ? '' : 's'}`
        : shareType === 'direct' 
          ? `Post shared with ${selectedRecipients.length} ${selectedRecipients.length === 1 ? 'person' : 'people'}`
          : "Post shared publicly!";
    
    toast({
      description: message,
      duration: 3000,
    });
  };

  const toggleRecipient = (contactId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const copyLink = () => {
    const link = `${window.location.origin}/post/${post?.id}`;
    navigator.clipboard.writeText(link);
    setShareType('link');
    handleShare();
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Share Post</span>
          </DialogTitle>
        </DialogHeader>

        {/* Post Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-sm">
              {post.avatar}
            </div>
            <div>
              <p className="font-semibold text-sm">{post.author}</p>
              <p className="text-xs text-gray-500">{post.time} ago</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          {/* Share Type Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={shareType === 'public' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShareType('public')}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Public
            </Button>
            <Button
              variant={shareType === 'direct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShareType('direct')}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Direct
            </Button>
            <Button
              variant={shareType === 'message' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShareType('message')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              variant={shareType === 'link' ? 'default' : 'outline'}
              size="sm"
              onClick={copyLink}
              className="flex-1"
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>

          {/* Share Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Add a message (optional)
            </label>
            <Textarea
              placeholder={shareType === 'message' ? "Share your thoughts about this post..." : "What do you think about this post?"}
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Recipients (for direct sharing and messaging) */}
          {(shareType === 'direct' || shareType === 'message') && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {shareType === 'message' ? 'Select conversations' : 'Select recipients'}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {allRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedRecipients.includes(recipient.id)
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
                    }`}
                    onClick={() => toggleRecipient(recipient.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-sm bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white font-bold">
                            {shareType === 'message' ? recipient.avatar : recipient.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {recipient.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{recipient.name}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${recipient.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {recipient.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    {selectedRecipients.includes(recipient.id) && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleShare} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Send className="w-4 h-4 mr-2" />
              {shareType === 'message' ? 'Send to Messages' : 'Share Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
