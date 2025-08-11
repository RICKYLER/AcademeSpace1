import React, { useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Smile, Video, Globe, Users as UsersIcon, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

type Audience = 'Public' | 'Friends' | 'Only Me';

interface PostComposerProps {
  onCreatePost: (content: string, attachments: AttachedFile[], audience: Audience) => void;
  currentUserName?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({ onCreatePost, currentUserName }) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [audience, setAudience] = useState<Audience>('Public');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const audienceIcon = useMemo(() => {
    switch (audience) {
      case 'Public':
        return <Globe className="w-4 h-4" />;
      case 'Friends':
        return <UsersIcon className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  }, [audience]);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const mapped = files.map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...mapped]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((f) => f.id !== id));
  };

  const hasContent = content.trim().length > 0 || attachments.length > 0;

  const submitPost = () => {
    if (!hasContent) return;
    onCreatePost(content.trim(), attachments, audience);
    setContent('');
    setAttachments([]);
    setAudience('Public');
    setIsExpanded(false);
  };

  // Collapsed view (small box)
  if (!isExpanded) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg">😊</div>
          <button
            className="flex-1 text-left px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => setIsExpanded(true)}
          >
            {`What's on your mind${currentUserName ? `, ${currentUserName}` : ''}?`}
          </button>
        </div>
        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => fileInputRef.current?.click(), 0);
            }}
          >
            <ImageIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm">Photo/Video</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            onClick={() => setIsExpanded(true)}
          >
            <Smile className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">Feeling/Activity</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            onClick={() => setIsExpanded(true)}
          >
            <Video className="w-5 h-5 text-red-500" />
            <span className="text-sm">Live Video</span>
          </button>
        </div>
        {/* Hidden input to trigger immediately after expand */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="*/*"
          onChange={(e) => {
            // If a user triggered from Photo/Video, we will capture files after expanded
            if (!isExpanded) setIsExpanded(true);
          }}
        />
      </div>
    );
  }

  // Expanded view (big composer)
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg">😊</div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">{currentUserName || 'You'}</div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {audienceIcon}
                <select
                  className="bg-transparent outline-none text-xs"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as Audience)}
                >
                  <option value="Public">Public</option>
                  <option value="Friends">Friends</option>
                  <option value="Only Me">Only Me</option>
                </select>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <textarea
          className="w-full bg-transparent rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
          placeholder={`What's on your mind${currentUserName ? `, ${currentUserName}` : ''}?`}
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {/* Image grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {attachments
              .filter((f) => f.type.startsWith('image/'))
              .map((file) => (
                <div key={file.id} className="relative group overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.url} alt={file.name} className="w-full h-40 object-cover" />
                  <button
                    onClick={() => removeAttachment(file.id)}
                    className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
          {/* Non-image list */}
          <div className="space-y-2">
            {attachments
              .filter((f) => !f.type.startsWith('image/'))
              .map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-800 dark:text-gray-200 truncate mr-3">{file.name}</span>
                  <button onClick={() => removeAttachment(file.id)} className="text-xs text-red-500">Remove</button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm">Photo/Video</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <Smile className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">Feeling/Activity</span>
          </button>
          <button
            type="button"
            className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <Video className="w-5 h-5 text-red-500" />
            <span className="text-sm">Live Video</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(false)}
            className="border-gray-300 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button onClick={submitPost} disabled={!hasContent} className="bg-blue-600 hover:bg-blue-700">
            Post
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="*/*"
          onChange={handleSelectFiles}
        />
      </div>
    </div>
  );
};

export default PostComposer;


