import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Info, Smile, Paperclip, ArrowLeft, Plus, Star, Archive, Bell, BellOff, Forward, Copy, Users, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import VideoCallInterface from './VideoCallInterface';
import FileAttachment from './FileAttachment';
import EmojiPicker from './EmojiPicker';
import { useToast } from '../../hooks/use-toast';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isForwarded?: boolean;
  originalSender?: string;
  sharedPost?: {
    id: number;
    author: string;
    content: string;
    avatar: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  isOnline?: boolean;
}

const MessagesContent: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [showFileAttachment, setShowFileAttachment] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [forwardRecipients, setForwardRecipients] = useState<string[]>([]);
  const [forwardMessage, setForwardMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      lastMessage: 'Hey! Are you ready for the calculus exam tomorrow?',
      timestamp: '2 min ago',
      unread: 2,
      avatar: 'SC',
      isOnline: true
    },
    {
      id: '2',
      name: 'Study Group - CS101',
      lastMessage: 'Meeting at 3 PM in the library',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: 'SG',
      isOnline: false
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      lastMessage: 'Thanks for sharing your notes!',
      timestamp: '3 hours ago',
      unread: 1,
      avatar: 'AR',
      isOnline: true
    },
    {
      id: '4',
      name: 'Emma Thompson',
      lastMessage: 'Can we schedule a tutoring session?',
      timestamp: 'Yesterday',
      unread: 0,
      avatar: 'ET',
      isOnline: false
    }
  ];

  const initialMessages: Message[] = [
    {
      id: '1',
      sender: 'Sarah Chen',
      content: 'Hey! Are you ready for the calculus exam tomorrow?',
      timestamp: '2:30 PM',
      isMe: false,
      status: 'read'
    },
    {
      id: '2',
      sender: 'You',
      content: 'I think so! I\'ve been studying all week. How about you?',
      timestamp: '2:32 PM',
      isMe: true,
      status: 'delivered'
    },
    {
      id: '3',
      sender: 'Sarah Chen',
      content: 'Same here. Want to do a quick review session together?',
      timestamp: '2:33 PM',
      isMe: false,
      status: 'read'
    },
    {
      id: '4',
      sender: 'You',
      content: 'That sounds great! Meet at the library in 30 minutes?',
      timestamp: '2:35 PM',
      isMe: true,
      status: 'sent'
    }
  ];

  // Initialize messages
  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  // Listen for real-time post sharing events
  useEffect(() => {
    const handlePostShared = (event: CustomEvent) => {
      const { postData, message, recipients } = event.detail;
      
      // Check if current conversation is in recipients
      if (selectedConversation && recipients.includes(`msg-${selectedConversation}`)) {
        const sharedMessage: Message = {
          id: Date.now().toString(),
          sender: 'You',
          content: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: 'sent',
          sharedPost: postData
        };

        setMessages(prev => [...prev, sharedMessage]);
        
        toast({
          title: "Post shared",
          description: "Post shared successfully to this conversation",
        });
      }
    };

    window.addEventListener('postShared', handlePostShared as EventListener);
    
    return () => {
      window.removeEventListener('postShared', handlePostShared as EventListener);
    };
  }, [selectedConversation, toast]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate real-time message delivery and read receipts
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.isMe && msg.status === 'sent') {
            return { ...msg, status: 'delivered' };
          }
          if (msg.isMe && msg.status === 'delivered' && Math.random() > 0.7) {
            return { ...msg, status: 'read' };
          }
          return msg;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    if (newMessage.length > 0) {
      setIsTyping('You');
      typingTimeout = setTimeout(() => {
        setIsTyping(null);
      }, 1000);
    }

    return () => clearTimeout(typingTimeout);
  }, [newMessage]);

  const handleSendMessage = () => {
    if (newMessage.trim() || attachedFiles.length > 0) {
      const messageId = Date.now().toString();
      const newMsg: Message = {
        id: messageId,
        sender: 'You',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        status: 'sent'
      };

      setMessages(prev => [...prev, newMsg]);
      
      if (attachedFiles.length > 0) {
        toast({
          title: "Files sent",
          description: `${attachedFiles.length} file(s) sent successfully`,
        });
      }
      
      // Simulate real-time response
      setTimeout(() => {
        simulateResponse();
      }, 1000 + Math.random() * 2000);

      setNewMessage('');
      setAttachedFiles([]);
      setShowFileAttachment(false);
      setShowEmojiPicker(false);
    }
  };

  const simulateResponse = () => {
    const responses = [
      "Got it! Thanks for letting me know.",
      "Sounds good to me!",
      "I'll be there on time.",
      "Perfect! See you then.",
      "That works for me too."
    ];
    
    const selectedConv = conversations.find(c => c.id === selectedConversation);
    if (selectedConv) {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: selectedConv.name,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        status: 'read'
      };

      setMessages(prev => [...prev, responseMsg]);
    }
  };

  const handleForwardMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowForwardModal(true);
  };

  const handleSendForward = () => {
    if (!selectedMessage || forwardRecipients.length === 0) {
      toast({
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    const forwardedMsg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: forwardMessage.trim() || selectedMessage.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
      isForwarded: true,
      originalSender: selectedMessage.sender
    };

    setMessages(prev => [...prev, forwardedMsg]);

    toast({
      title: "Message forwarded",
      description: `Forwarded to ${forwardRecipients.length} ${forwardRecipients.length === 1 ? 'person' : 'people'}`,
    });

    // Reset forward modal
    setShowForwardModal(false);
    setSelectedMessage(null);
    setForwardRecipients([]);
    setForwardMessage('');
  };

  const handleSharePost = (post: any, customMessage?: string) => {
    const sharedMsg: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: customMessage || `Check out this post from ${post.author}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
      sharedPost: post
    };

    setMessages(prev => [...prev, sharedMsg]);

    toast({
      title: "Post shared",
      description: "Successfully shared the post in your conversation",
    });
  };

  const toggleRecipient = (conversationId: string) => {
    setForwardRecipients(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const handleVideoCall = () => {
    setIsVideoCallActive(true);
    toast({
      title: "Video call started",
      description: "Connecting to video call...",
    });
  };

  const handleVoiceCall = () => {
    toast({
      title: "Voice call started",
      description: "Connecting to voice call...",
    });
  };

  const handleEndCall = () => {
    setIsVideoCallActive(false);
    toast({
      title: "Call ended",
      description: "Video call has been ended",
    });
  };

  const handleFileSelect = (files: any[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <VideoCallInterface
        isActive={isVideoCallActive}
        onEndCall={handleEndCall}
        participantName={selectedConv?.name || ''}
        participantAvatar={selectedConv?.avatar || ''}
      />

      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] animate-fade-in">
        <div className="flex h-full">
          {/* Enhanced Conversations List */}
          <div className={`w-full sm:w-80 md:w-96 border-r border-gray-200/30 dark:border-gray-700/30 flex flex-col bg-gradient-to-b from-gray-50/80 via-blue-50/30 to-purple-50/20 dark:from-gray-800/80 dark:via-blue-900/20 dark:to-purple-900/10 backdrop-blur-sm ${showMobileChat ? 'hidden sm:flex' : 'flex'}`}>
            {/* Enhanced Header */}
            <div className="p-3 sm:p-6 border-b border-gray-200/30 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs sm:text-sm font-bold">M</span>
                  </div>
                  <span className="hidden sm:inline">Messages</span>
                </h2>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all hover:scale-110">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  className="pl-10 sm:pl-12 text-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-600/30 focus:ring-2 focus:ring-blue-500/30 focus:border-transparent rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Enhanced Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group relative overflow-hidden animate-fade-in hover:scale-[1.02] ${
                      selectedConversation === conversation.id
                        ? 'bg-white/95 dark:bg-gray-800/95 shadow-xl border border-blue-200/50 dark:border-blue-800/50 transform scale-[1.02] backdrop-blur-lg'
                        : 'hover:bg-white/70 dark:hover:bg-gray-800/70 hover:shadow-lg backdrop-blur-sm'
                    }`}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {selectedConversation === conversation.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl sm:rounded-2xl"></div>
                    )}
                    
                    <div className="flex items-start space-x-2 sm:space-x-3 relative z-10">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all">
                          {conversation.avatar}
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 sm:border-3 border-white dark:border-gray-900 shadow-lg animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {conversation.name}
                          </h3>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {conversation.timestamp}
                            </span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate leading-relaxed">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Enhanced Chat Area */}
          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden sm:flex' : 'flex'}`}>
            {selectedConversation && selectedConv ? (
              <>
                {/* Enhanced Chat Header */}
                <div className="p-3 sm:p-5 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-white/90 via-blue-50/40 to-purple-50/30 dark:from-gray-900/90 dark:via-blue-900/20 dark:to-purple-900/10 backdrop-blur-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:hidden rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {selectedConv.avatar}
                      </div>
                      {selectedConv.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-md animate-pulse"></div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg">
                        {selectedConv.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${selectedConv.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <p className={`text-xs sm:text-sm font-medium ${selectedConv.isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                          {selectedConv.isOnline ? 'Active now' : 'Last seen recently'}
                        </p>
                      </div>
                      {isTyping && (
                        <p className="text-xs text-blue-500 animate-pulse">
                          {isTyping} is typing...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-110 transition-all"
                      onClick={handleVoiceCall}
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 transition-all"
                      onClick={handleVideoCall}
                    >
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-110 transition-all">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </Button>
                  </div>
                </div>

                {/* Enhanced File Attachment Panel */}
                {showFileAttachment && (
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50/90 to-blue-50/50 dark:from-gray-800/90 dark:to-blue-900/30 border-b border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm animate-fade-in">
                    <FileAttachment
                      onFileSelect={handleFileSelect}
                      attachedFiles={attachedFiles}
                      onRemoveFile={handleRemoveFile}
                    />
                  </div>
                )}

                {/* Enhanced Messages Area */}
                <ScrollArea className="flex-1 p-3 sm:p-6 bg-gradient-to-br from-gray-50/40 via-blue-50/20 to-purple-50/10 dark:from-gray-800/40 dark:via-blue-900/10 dark:to-purple-900/5 backdrop-blur-sm">
                  <div className="space-y-4 sm:space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md relative ${message.isMe ? 'order-2' : 'order-1'}`}>
                          {/* Forward/Share actions */}
                          <div className={`opacity-0 group-hover:opacity-100 transition-all duration-200 mb-2 flex ${message.isMe ? 'justify-end' : 'justify-start'} space-x-1`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs bg-white/80 dark:bg-gray-800/80 shadow-sm hover:shadow-md"
                              onClick={() => handleForwardMessage(message)}
                            >
                              <Forward className="w-3 h-3 mr-1" />
                              Forward
                            </Button>
                            {message.sharedPost && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs bg-white/80 dark:bg-gray-800/80 shadow-sm hover:shadow-md"
                                onClick={() => handleSharePost(message.sharedPost)}
                              >
                                <Share2 className="w-3 h-3 mr-1" />
                                Reshare
                              </Button>
                            )}
                          </div>

                          {/* Message content */}
                          <div
                            className={`px-3 sm:px-5 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl relative overflow-hidden ${
                              message.isMe
                                ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white rounded-br-lg transform hover:scale-[1.02] shadow-blue-500/25'
                                : 'bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white border border-gray-200/30 dark:border-gray-700/30 rounded-bl-lg hover:bg-white dark:hover:bg-gray-800 shadow-gray-500/10'
                            }`}
                          >
                            {message.isMe && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl"></div>
                            )}
                            
                            {/* Forwarded message indicator */}
                            {message.isForwarded && (
                              <div className="flex items-center text-xs opacity-70 mb-2 relative z-10">
                                <Forward className="w-3 h-3 mr-1" />
                                <span>Forwarded from {message.originalSender}</span>
                              </div>
                            )}

                            {/* Shared post */}
                            {message.sharedPost && (
                              <div className="mb-3 p-3 rounded-xl bg-white/20 dark:bg-gray-900/20 relative z-10 border border-white/30">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-xs font-bold">
                                    {message.sharedPost.avatar}
                                  </div>
                                  <span className="text-xs font-semibold opacity-90">{message.sharedPost.author}</span>
                                </div>
                                <p className="text-xs opacity-80 line-clamp-3 leading-relaxed">{message.sharedPost.content}</p>
                                <div className="mt-2 text-xs opacity-60 flex items-center">
                                  <Share2 className="w-3 h-3 mr-1" />
                                  <span>Shared post</span>
                                </div>
                              </div>
                            )}

                            <p className="text-sm leading-relaxed relative z-10 font-medium">{message.content}</p>
                          </div>
                          
                          <div className={`flex items-center mt-2 space-x-2 ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {message.timestamp}
                            </span>
                            {message.isMe && message.status && (
                              <div className={`text-xs font-medium flex items-center ${
                                message.status === 'read' ? 'text-blue-500' :
                                message.status === 'delivered' ? 'text-gray-400' : 'text-gray-300'
                              }`}>
                                <span className="text-lg leading-none">✓✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Enhanced Message Input */}
                <div className="p-3 sm:p-5 border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-white/90 via-blue-50/40 to-purple-50/30 dark:from-gray-900/90 dark:via-blue-900/20 dark:to-purple-900/10 backdrop-blur-lg relative">
                  <div className="flex items-end space-x-2 sm:space-x-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 transition-all"
                      onClick={() => setShowFileAttachment(!showFileAttachment)}
                    >
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-10 sm:pr-12 py-2 sm:py-3 rounded-2xl sm:rounded-3xl border-gray-300/30 dark:border-gray-600/30 focus:ring-2 focus:ring-blue-500/30 focus:border-transparent bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all shadow-sm hover:shadow-md text-sm"
                      />
                      <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:scale-110 transition-all"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSendMessage} 
                      size="icon"
                      className="rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 p-2 sm:p-3"
                      disabled={!newMessage.trim() && attachedFiles.length === 0}
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                  
                  {/* Emoji Picker */}
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              </>
            ) : (
              // Empty state
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 via-blue-50/20 to-purple-50/20 dark:from-gray-800/50 dark:via-blue-900/10 dark:to-purple-900/10 p-4">
                <div className="text-center text-gray-500 dark:text-gray-400 max-w-md animate-fade-in">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Send className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to Messages</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Select a conversation from the sidebar to start messaging with your classmates and study groups.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forward Modal */}
      <Dialog open={showForwardModal} onOpenChange={setShowForwardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Forward className="w-5 h-5" />
              <span>Forward Message</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedMessage?.content}
              </p>
            </div>

            {/* Recipients */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Forward to:
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                      forwardRecipients.includes(conversation.id)
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => toggleRecipient(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {conversation.avatar}
                      </div>
                      <span className="font-semibold text-sm">{conversation.name}</span>
                    </div>
                    {forwardRecipients.includes(conversation.id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Optional message */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add a message (optional)
              </label>
              <Textarea
                placeholder="Add your thoughts..."
                value={forwardMessage}
                onChange={(e) => setForwardMessage(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowForwardModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSendForward} className="flex-1">
                <Forward className="w-4 h-4 mr-2" />
                Forward
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesContent;
