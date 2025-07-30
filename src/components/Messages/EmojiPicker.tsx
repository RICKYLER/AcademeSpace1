
import React, { useState } from 'react';
import { Smile, Heart, Laugh, Angry, Frown, AlertCircle, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');

  const emojiCategories = {
    smileys: {
      name: 'Smileys & Emotion',
      icon: <Smile className="w-4 h-4" />,
      color: 'from-yellow-400 to-orange-400',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
    },
    people: {
      name: 'People & Body',
      icon: <Heart className="w-4 h-4" />,
      color: 'from-pink-400 to-red-400',
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋']
    },
    animals: {
      name: 'Animals & Nature',
      icon: <Laugh className="w-4 h-4" />,
      color: 'from-green-400 to-emerald-400',
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']
    },
    food: {
      name: 'Food & Drink',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'from-orange-400 to-red-400',
      emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯']
    },
    activities: {
      name: 'Activities',
      icon: <Angry className="w-4 h-4" />,
      color: 'from-purple-400 to-blue-400',  
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🥁', '🪘', '🎹', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩']
    },
    objects: {
      name: 'Objects',
      icon: <Frown className="w-4 h-4" />,
      color: 'from-gray-400 to-slate-400',
      emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪓', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛏️', '🛋️', '🪞', '🚽', '🪠', '🚿', '🛁', '🪤', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🪥', '🧽', '🧯', '🛒', '🚬']
    }
  };

  const filteredEmojis = searchTerm
    ? emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis.filter(emoji =>
        emoji.includes(searchTerm)
      )
    : emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:relative md:inset-auto md:flex md:items-start md:justify-start">
      {/* Mobile Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      
      {/* Emoji Picker Container */}
      <div className="relative w-full max-w-md mx-4 mb-4 md:mx-0 md:mb-0 md:absolute md:bottom-full md:left-0 md:mb-2 md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-scale-in">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/40 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/10 rounded-t-3xl md:rounded-t-3xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Emojis
            </h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all shadow-sm hover:shadow-md text-sm"
            />
          </div>

          {/* Enhanced Category Tabs */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-2">
            {Object.entries(emojiCategories).map(([key, category]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(key);
                  setSearchTerm('');
                }}
                className={`flex-shrink-0 rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105 font-semibold`
                    : 'hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={selectedCategory === key ? 'filter brightness-0 invert' : ''}>
                    {category.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block truncate max-w-[60px]">
                    {category.name.split(' ')[0]}
                  </span>
                </div>
                {selectedCategory === key && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Enhanced Emoji Grid */}
        <ScrollArea className="h-80 p-4">
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onEmojiSelect(emoji);
                  onClose();
                }}
                className="h-12 w-12 p-0 text-2xl hover:bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 hover:scale-125 transition-all duration-200 rounded-xl border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 hover:shadow-lg relative group"
              >
                <span className="filter group-hover:drop-shadow-lg transition-all duration-200 group-hover:scale-110">
                  {emoji}
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Button>
            ))}
          </div>
          
          {filteredEmojis.length === 0 && searchTerm && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <h4 className="text-lg font-semibold mb-2">No emojis found</h4>
              <p className="text-sm">Try a different search term or browse categories</p>
            </div>
          )}
        </ScrollArea>

        {/* Enhanced Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 via-blue-50/40 to-purple-50/20 dark:from-gray-800/80 dark:via-blue-900/20 dark:to-purple-900/10 rounded-b-3xl border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
            Click any emoji to add it to your message • {filteredEmojis.length} emojis
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
