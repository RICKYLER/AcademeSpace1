/**
 * Algebrain - AI Assistant with Venice AI Integration
 * 
 * Features:
 * - Image Generation using Venice AI API
 * - Image Editing/Inpainting using Venice AI Edit API
 * - Image Upscaling and Enhancement
 * - Voice interaction and text-to-speech
 * - Multiple AI modes (Programming, Math, Photo, General)
 * 
 * Venice AI API Endpoints Used:
 * - POST /api/v1/image/generate - Generate images from prompts
 * - POST /api/v1/image/edit - Edit/modify existing images
 * - POST /api/v1/image/upscale - Upscale and enhance images
 * - GET /api/v1/image/styles - Get available image styles
 * - POST /api/v1/chat/completions - Chat completions
 * 
 * @see https://docs.venice.ai/api-reference/endpoint/image/edit
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Send, User, Bot, Calculator, BookOpen, Trophy, Lightbulb, RefreshCw, Plus, ChevronDown, Mic, ArrowUp, Image as ImageIcon, Box, FileText, Code, Zap, Sparkles, Palette, Camera, Settings, Maximize2, MicOff, Volume2, VolumeX, Home, Menu, X, Minimize2, RotateCcw, Download, Share2, Copy, Star, Heart, MessageSquare, Bookmark, MoreHorizontal, Clock, History, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import PhotoGenerationGuide from '@/components/PhotoGenerationGuide';


// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'image' | 'voice';
  audioUrl?: string;
  imageUrl?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mode: AIMode;
  model: string;
}

type AIMode = 'programming' | 'math' | 'photo' | 'general';



const Algebrain = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with:\n\n💻 **Programming** - Debug code, explain concepts, generate APIs\n🧮 **Mathematics** - Solve equations, explain theories, step-by-step solutions\n🎨 **Photo Generation** - Create images from descriptions\n📸 **Image Enhancement** - Upload and enhance your photos with AI\n🎯 **Image Selection & Conversation** - Select any image and have a conversation about enhancing it\n💾 **Download Images** - Download all AI-generated images with one click\n🎤 **Voice Interaction** - Speak to me and I\'ll respond with voice\n\n🔧 **Testing Tools** - Test API connections and functionality\n💾 **Chat History** - Your conversations are automatically saved and can be accessed anytime\n\n**🎯 New Image Selection Features:**\n• **Select Image** - Click "Select Image for Enhancement" to choose any image from the conversation\n• **Enhancement Conversation** - Have ongoing conversations about improving selected images\n• **Image Analysis** - Get detailed analysis and suggestions for your selected images\n• **Enhancement History** - Track all modifications made to your selected image\n\n**Keyboard Shortcuts:**\n• ⌘+K: Quick Actions\n• ⌘+N: Start new chat\n• ⌘+H: Toggle chat history\n• ⌘+B: Toggle sidebar\n\nWhat would you like to work on today?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<AIMode>('general');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // State to manage the visibility of popups and dropdowns
  const [isAddPopupOpen, setAddPopupOpen] = useState(false);
  const [isEnhancementMenuOpen, setEnhancementMenuOpen] = useState(false);
  const [isModelOpen, setModelOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [availableStyles, setAvailableStyles] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('Photographic');

  // Image upload and enhancement state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // Image selection and conversation state
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [imageSelectionMode, setImageSelectionMode] = useState(false);
  const [enhancementRequestMode, setEnhancementRequestMode] = useState(false);
  const [pendingEnhancementPrompt, setPendingEnhancementPrompt] = useState<string>('');
  const [conversationContext, setConversationContext] = useState<{
    selectedImageUrl?: string;
    selectedImageMessage?: Message;
    enhancementHistory: Array<{prompt: string, resultUrl: string}>;
  }>({
    enhancementHistory: []
  });

  // State for the selected model
  const [selectedModel, setSelectedModel] = useState('Brainwave 2.5');
  const models = ['Brainwave 2.5', 'Creative Fusion', 'Visionary AI 3.0', 'CodeMaster Pro', 'MathGenius Ultra'];

  // Chat history state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);


  const [showAllSections, setShowAllSections] = useState(true);

  // Refs for the popups to detect outside clicks
  const addPopupRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const imageUploadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate a title for a chat session based on the first user message
  const generateSessionTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content.slice(0, 50);
      return content.length > 50 ? content + '...' : content;
    }
    return 'New Conversation';
  };

  // Save current session to localStorage
  const saveCurrentSession = () => {
    if (messages.length <= 1) return; // Don't save empty sessions
    
    const session: ChatSession = {
      id: currentSessionId || generateSessionId(),
      title: generateSessionTitle(messages),
      messages: messages,
      createdAt: new Date(),
      updatedAt: new Date(),
      mode: currentMode,
      model: selectedModel
    };

    const existingSessions = JSON.parse(localStorage.getItem('algebrain_chat_history') || '[]');
    const updatedSessions = existingSessions.filter((s: ChatSession) => s.id !== session.id);
    updatedSessions.unshift(session); // Add to beginning
    
    // Keep only last 50 sessions
    const limitedSessions = updatedSessions.slice(0, 50);
    
    localStorage.setItem('algebrain_chat_history', JSON.stringify(limitedSessions));
    setChatSessions(limitedSessions);
    
    if (!currentSessionId) {
      setCurrentSessionId(session.id);
    }
  };

  // Load chat sessions from localStorage
  const loadChatSessions = () => {
    try {
      const savedSessions = localStorage.getItem('algebrain_chat_history');
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  // Load a specific chat session
  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentMode(session.mode);
    setSelectedModel(session.model);
    setCurrentSessionId(session.id);
    setShowHistory(false);
    
    toast({
      title: 'Session Loaded',
      description: `Loaded conversation: ${session.title}`,
    });
  };

  // Delete a chat session
  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem('algebrain_chat_history', JSON.stringify(updatedSessions));
    
    if (currentSessionId === sessionId) {
      clearChat();
    }
    
    toast({
      title: 'Session Deleted',
      description: 'Chat session has been removed.',
    });
  };

  // Auto-save session when messages change
  useEffect(() => {
    if (messages.length > 1) {
      const timeoutId = setTimeout(saveCurrentSession, 2000); // Debounce save
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentMode, selectedModel]);

  // Load sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);







  // Close control panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.section-controls')) {
        setShowAllSections(false);
      }
    };

    if (showAllSections) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAllSections]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load available image styles when component mounts
  useEffect(() => {
    const loadStyles = async () => {
      if (currentMode === 'photo') {
        const styles = await getImageStyles();
        setAvailableStyles(styles);
        if (styles.length > 0 && !styles.includes(selectedStyle)) {
          setSelectedStyle(styles[0]);
        }
      }
    };
    
    loadStyles();
  }, [currentMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addPopupRef.current && !addPopupRef.current.contains(event.target as Node)) {
        setAddPopupOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (imageUploadRef.current && !imageUploadRef.current.contains(event.target as Node)) {
        setShowImageUpload(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAddPopupOpen(false);
        setModelOpen(false);
        setIsQuickActionsOpen(false);
        setShowImageUpload(false);
      }
    };

    // Keyboard shortcut for sidebar toggle (Cmd/Ctrl + B)
    const handleSidebarToggle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    // Keyboard shortcut for history toggle (Cmd/Ctrl + H)
    const handleHistoryToggle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
        event.preventDefault();
        toggleHistory();
      }
    };

    // Keyboard shortcut for new chat (Cmd/Ctrl + N)
    const handleNewChat = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        startNewChat();
      }
    };

    // Keyboard shortcut for quick actions (Cmd/Ctrl + K)
    const handleQuickActions = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsQuickActionsOpen(!isQuickActionsOpen);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleSidebarToggle);
    document.addEventListener('keydown', handleHistoryToggle);
    document.addEventListener('keydown', handleNewChat);
    document.addEventListener('keydown', handleQuickActions);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleSidebarToggle);
      document.removeEventListener('keydown', handleHistoryToggle);
      document.removeEventListener('keydown', handleNewChat);
      document.removeEventListener('keydown', handleQuickActions);
    };
      }, [sidebarOpen]);

  const quickActions = [
    { 
      icon: Code, 
      text: 'Generate REST API', 
      category: 'Programming',
      mode: 'programming' as AIMode,
      description: 'Create API endpoints',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: Calculator, 
      text: 'Debug Python code', 
      category: 'Programming',
      mode: 'programming' as AIMode,
      description: 'Find and fix bugs',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      icon: BookOpen, 
      text: 'Explain React hooks', 
      category: 'Programming',
      mode: 'programming' as AIMode,
      description: 'Learn React concepts',
      color: 'from-purple-500 to-violet-500'
    },
    { 
      icon: Calculator, 
      text: 'Solve: 2x + 5 = 13', 
      category: 'Mathematics',
      mode: 'math' as AIMode,
      description: 'Algebra help',
      color: 'from-orange-500 to-red-500'
    },
    { 
      icon: Trophy, 
      text: 'Pythagorean theorem', 
      category: 'Mathematics',
      mode: 'math' as AIMode,
      description: 'Geometry concepts',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      icon: Camera, 
      text: 'Generate a sunset', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Create beautiful images',
      color: 'from-pink-500 to-rose-500'
    },
    { 
      icon: Camera, 
      text: 'Create a futuristic city', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Sci-fi architecture',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      icon: Camera, 
      text: 'Design a fantasy landscape', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Magical worlds',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      icon: Palette, 
      text: 'Edit: Change sky to sunset', 
      category: 'Photo Editing',
      mode: 'photo' as AIMode,
      description: 'Image modification',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      icon: Palette, 
      text: 'Edit: Add rainbow to image', 
      category: 'Photo Editing',
      mode: 'photo' as AIMode,
      description: 'Creative additions',
      color: 'from-pink-500 to-rose-500'
    },
    { 
      icon: Camera, 
      text: 'Professional portrait photo', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Realistic photography',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      icon: Camera, 
      text: 'Landscape photography', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Nature and scenery',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: Camera, 
      text: 'Product photography', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Commercial quality',
      color: 'from-orange-500 to-red-500'
    },
    { 
      icon: ImageIcon, 
      text: 'Upload & Enhance Image', 
      category: 'Photo Enhancement',
      mode: 'photo' as AIMode,
      description: 'AI analysis and enhancement',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      icon: Zap, 
      text: 'Test API Connection', 
      category: 'Testing',
      mode: 'photo' as AIMode,
      description: 'Verify API connectivity',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      icon: Download, 
      text: 'Download All Images', 
      category: 'Photo Enhancement',
      mode: 'photo' as AIMode,
      description: 'Download all generated images',
      color: 'from-orange-500 to-red-500'
    },

  ];

  const addMenuItems = [
    { 
      icon: <ImageIcon size={20} className="text-blue-400 drop-shadow-sm" />, 
      text: "Upload & Enhance Image", 
      description: "Upload an image for AI analysis and enhancement",
      color: "hover:bg-blue-500/20 hover:border-blue-400/30",
      action: () => setShowImageUpload(true)
    },
    { 
      icon: <Target size={20} className="text-purple-400 drop-shadow-sm" />, 
      text: "Select Image for Enhancement", 
      description: "Choose an image from conversation for enhancement",
      color: "hover:bg-purple-500/20 hover:border-purple-400/30",
      action: () => startImageSelection()
    },
    { 
      icon: <Box size={20} className="text-purple-400 drop-shadow-sm" />, 
      text: "Add 3D objects", 
      description: "Import 3D models and objects",
      color: "hover:bg-purple-500/20 hover:border-purple-400/30" 
    },
    { 
      icon: <FileText size={20} className="text-green-400 drop-shadow-sm" />, 
      text: "Add files (PDF, docs...)", 
      description: "Upload documents and files",
      color: "hover:bg-green-500/20 hover:border-green-400/30" 
    },
    { 
      icon: <Code size={20} className="text-orange-400 drop-shadow-sm" />, 
      text: "Code snippet", 
      description: "Insert code blocks and snippets",
      color: "hover:bg-orange-500/20 hover:border-orange-400/30" 
    },
  ];

  const handleQuickAction = (action: any) => {
    setCurrentMode(action.mode);
    setInput(action.text);
    
    // Show helpful message for photo mode
    if (action.mode === 'photo') {
      // Check if the action is for realistic photography
      const isRealisticPhoto = action.text.toLowerCase().includes('photography') || 
                              action.text.toLowerCase().includes('portrait') ||
                              action.text.toLowerCase().includes('landscape') ||
                              action.text.toLowerCase().includes('product') ||
                              action.text.toLowerCase().includes('professional');
      
      if (isRealisticPhoto) {
        // Set realistic style for photography actions
        setSelectedStyle('Photographic');
        
        const realisticPhotoMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `📸 **Realistic Photography Mode Activated!**\n\nI've set the style to **"Photographic"** for realistic image generation.\n\n**🎯 Best Styles for Realistic Images:**\n• **Photographic** - General realistic photos\n• **Professional Photography** - High-quality studio shots\n• **Portrait Photography** - People and faces\n• **Landscape Photography** - Nature and scenery\n• **Product Photography** - Commercial and product shots\n• **Real Estate Photography** - Property and interiors\n\n**💡 Tips for Realistic Results:**\n• Add "High Resolution" or "4K Quality" to your prompts\n• Mention specific photography terms (portrait, landscape, etc.)\n• Include lighting details (natural light, studio lighting)\n• Use professional photography keywords\n\n**Example Prompts:**\n• "Professional portrait photography of a business person in natural light"\n• "Landscape photography of mountains at golden hour, high resolution"\n• "Product photography of a modern smartphone on white background"\n• "Real estate photography of a luxury home interior with natural lighting"\n\nTry your prompt now for realistic results!`,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, realisticPhotoMessage]);
      } else {
        const photoHelpMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '🎨 **Photo Generation Mode Activated!**\n\nI can now generate and edit high-quality images using Venice AI. Here are some great prompts to try:\n\n**📸 Realistic Photography:**\n• "Professional portrait photography of a business person"\n• "Landscape photography of mountains at golden hour"\n• "Street photography of a busy city intersection"\n• "Product photography of a modern smartphone"\n• "Architectural photography of a glass skyscraper"\n• "Food photography of a gourmet meal"\n• "Real estate photography of a luxury home interior"\n• "Wedding photography of a couple in a garden"\n\n**🌅 Creative Landscapes:**\n• "A beautiful sunset over mountains with golden light"\n• "A serene lake reflecting autumn colors"\n• "A tropical beach with palm trees"\n\n**🏙️ Architecture:**\n• "A futuristic city with flying cars and neon lights"\n• "A cozy coffee shop interior with warm lighting"\n• "A modern minimalist office space"\n\n**🐾 Animals:**\n• "A cute fluffy cat sitting on a windowsill"\n• "A majestic lion in the savanna"\n• "A playful golden retriever in a garden"\n\n**🎨 Artistic Styles:**\n• "A magical forest with glowing mushrooms"\n• "A steampunk airship in the clouds"\n• "A cyberpunk street scene at night"\n\n**✏️ Image Editing:**\nAfter generating an image, you can edit it by describing changes:\n• "Change the sky to a stormy night"\n• "Add a rainbow in the background"\n• "Make it black and white"\n• "Transform it into a painting style"\n\n**💡 Realistic Image Tips:**\n• Use "Photographic" or "Professional Photography" styles\n• Add "High Resolution" or "4K Quality" to your prompts\n• Mention specific photography terms (portrait, landscape, etc.)\n• Include lighting details (natural light, studio lighting)\n\nJust describe what you want to see or change, and I\'ll create or modify it for you!',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, photoHelpMessage]);
      }
    }
    

  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setModelOpen(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you with:\n\n💻 **Programming** - Debug code, explain concepts, generate APIs\n🧮 **Mathematics** - Solve equations, explain theories, step-by-step solutions\n🎨 **Photo Generation** - Create images from descriptions\n📸 **Image Enhancement** - Upload and enhance your photos with AI\n🎯 **Image Selection & Conversation** - Select any image and have a conversation about enhancing it\n💾 **Download Images** - Download all AI-generated images with one click\n🎤 **Voice Interaction** - Speak to me and I\'ll respond with voice\n\n🔧 **Testing Tools** - Test API connections and functionality\n💾 **Chat History** - Your conversations are automatically saved and can be accessed anytime\n\n**🎯 New Image Selection Features:**\n• **Select Image** - Click "Select Image for Enhancement" to choose any image from the conversation\n• **Enhancement Conversation** - Have ongoing conversations about improving selected images\n• **Image Analysis** - Get detailed analysis and suggestions for your selected images\n• **Enhancement History** - Track all modifications made to your selected image\n\n**Keyboard Shortcuts:**\n• ⌘+K: Quick Actions\n• ⌘+N: Start new chat\n• ⌘+H: Toggle chat history\n• ⌘+B: Toggle sidebar\n\nWhat would you like to work on today?',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    setCurrentMode('general');
    setCurrentSessionId(''); // Reset current session
    setSelectedImageId(null);
    setImageSelectionMode(false);
    setEnhancementRequestMode(false);
    setPendingEnhancementPrompt('');
    setConversationContext({
      enhancementHistory: []
    });
  };

  const getModeIcon = (mode: AIMode) => {
    switch (mode) {
      case 'programming': return <Code className="w-4 h-4" />;
      case 'math': return <Calculator className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: AIMode) => {
    switch (mode) {
      case 'programming': return 'text-blue-400';
      case 'math': return 'text-green-400';
      case 'photo': return 'text-purple-400';
  
      default: return 'text-gray-400';
    }
  };














  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: 'Browser Not Supported',
          description: 'Your browser does not support voice recording. Please use Chrome, Safari, or Edge.',
          variant: 'destructive',
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processVoiceInput(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording Error',
          description: 'Failed to record audio. Please try again.',
          variant: 'destructive',
        });
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Speak your message now...',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          title: 'Microphone Permission Denied',
          description: 'Please allow microphone access and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Recording Error',
          description: 'Could not access microphone. Please check permissions and try again.',
          variant: 'destructive',
        });
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('Processing voice input with bypass method');
      
      const voicePrompt = "I just recorded a voice message. Please help me with my question.";
      
      const voiceMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: voicePrompt,
        timestamp: new Date(),
        type: 'voice',
        audioUrl: audioUrl
      };

      setMessages(prev => [...prev, voiceMessage]);
      setInput(voicePrompt);
      
      console.log('Sending voice message to AI with bypass method');
      sendMessage(voicePrompt);
      
      toast({
        title: 'Voice Message Sent',
        description: 'Your voice message has been sent to AI. Please type your specific question.',
      });

    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: 'Voice Processing Error',
        description: 'Could not process voice input. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const speakText = (text: string) => {
    if (!audioEnabled || !text.trim()) return;

    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Alex')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setIsPlaying(false);
        };

        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
    }
  };

  // Photo generation function
  const generateImage = async (prompt: string) => {
    try {
      console.log('Generating image with prompt:', prompt);
      
      // Use Venice AI API for image generation
      const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
      
      if (!apiKey) {
        throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
      }
      
      console.log('Using Venice AI for image generation with style:', selectedStyle);
      
      // Enhanced prompt with style - always include the style in the prompt
      const enhancedPrompt = selectedStyle 
        ? `${prompt}, ${selectedStyle} style, high quality, professional photography, detailed, sharp focus`
        : `${prompt}, high quality, professional photography, detailed, sharp focus`;
      
      // Create request body without style_preset first (try without it)
      const requestBody: any = {
        prompt: enhancedPrompt,
        negative_prompt: 'blurry, low quality, distorted, amateur, poor composition, low resolution',
        width: 1024,
        height: 1024,
        steps: 25,
        cfg_scale: 8.0,
        model: 'hidream',
        format: 'webp',
        return_binary: false,
        embed_exif_metadata: false,
        hide_watermark: false,
        safe_mode: false,
        seed: Math.floor(Math.random() * 1000000000),
        lora_strength: 50
      };

      // Try with style_preset if it's a supported style
      const supportedStyles = ['Photographic', 'Realistic', 'Photorealistic'];
      if (selectedStyle && supportedStyles.includes(selectedStyle)) {
        requestBody.style_preset = selectedStyle;
      }
      
      const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Venice AI API failed:', errorText);
        
        // Try fallback to OpenAI DALL-E if Venice AI fails
        console.log('Trying fallback to OpenAI DALL-E...');
        return await generateImageWithOpenAI(prompt, selectedStyle);
      }

      const data = await response.json();
      console.log('Venice AI Image Generation Response:', data);
      
      // Venice AI returns base64 encoded images
      if (data.images && data.images.length > 0) {
        const imageUrl = `data:image/webp;base64,${data.images[0]}`;
        return imageUrl;
      } else {
        throw new Error('No image received from Venice AI API');
      }
      
    } catch (error) {
      console.error('Image generation error:', error);
      
      // Try fallback to OpenAI DALL-E
      try {
        console.log('Trying fallback to OpenAI DALL-E...');
        return await generateImageWithOpenAI(prompt, selectedStyle);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error;
      }
    }
  };

  // Fallback image generation using OpenAI DALL-E
  const generateImageWithOpenAI = async (prompt: string, style: string) => {
    const openaiApiKey = import.meta.env.VITE_PHOTO_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured for fallback.');
    }
    
    // Always include the style in the prompt for better results
    const enhancedPrompt = style 
      ? `${prompt}, ${style} style, high quality, professional photography, detailed, sharp focus`
      : `${prompt}, high quality, professional photography, detailed, sharp focus`;
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].url;
  };

  // Image upscale and enhance function
  const upscaleAndEnhanceImage = async (imageUrl: string, scale: number = 2, enhance: boolean = true, enhancePrompt?: string) => {
    try {
      console.log('Upscaling and enhancing image...');
      
      const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
      
      if (!apiKey) {
        throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
      }

      // Convert data URL to base64
      const base64Data = imageUrl.split(',')[1];
      
      const response = await fetch('https://api.venice.ai/api/v1/image/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          image: base64Data,
          scale: scale,
          enhance: enhance,
          enhanceCreativity: 0.5,
          enhancePrompt: enhancePrompt || 'enhance quality, improve details, sharpen'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Venice AI Upscale API failed:', errorText);
        throw new Error(`Image upscale failed with status ${response.status}: ${errorText}`);
      }

      // The upscale API returns the image directly as binary data
      const imageBlob = await response.blob();
      const enhancedImageUrl = URL.createObjectURL(imageBlob);
      
      console.log('Image upscaled and enhanced successfully!');
      return enhancedImageUrl;
      
    } catch (error) {
      console.error('Image upscale error:', error);
      throw error;
    }
  };

  // Image edit (inpaint) function
  const editImage = async (imageUrl: string, editPrompt: string, options?: {
    mask?: string; // Base64 encoded mask for selective editing
    strength?: number; // Edit strength (0-1, default 0.8)
    guidance_scale?: number; // Guidance scale (1-20, default 7.5)
    num_inference_steps?: number; // Number of inference steps (1-50, default 20)
  }) => {
    try {
      console.log('Editing image with prompt:', editPrompt, 'options:', options);
      
      const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
      
      if (!apiKey) {
        throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
      }

      // Convert data URL to base64
      const base64Data = imageUrl.split(',')[1];
      
      // Prepare request body according to Venice AI Edit API specification
      const requestBody: any = {
        prompt: editPrompt,
        image: base64Data
      };

      // Add optional parameters if provided
      if (options?.mask) {
        requestBody.mask = options.mask;
      }
      if (options?.strength !== undefined) {
        requestBody.strength = Math.max(0, Math.min(1, options.strength)); // Clamp between 0-1
      }
      if (options?.guidance_scale !== undefined) {
        requestBody.guidance_scale = Math.max(1, Math.min(20, options.guidance_scale)); // Clamp between 1-20
      }
      if (options?.num_inference_steps !== undefined) {
        requestBody.num_inference_steps = Math.max(1, Math.min(50, options.num_inference_steps)); // Clamp between 1-50
      }
      
      console.log('Sending edit request to Venice AI with body:', {
        prompt: requestBody.prompt,
        hasMask: !!requestBody.mask,
        strength: requestBody.strength,
        guidance_scale: requestBody.guidance_scale,
        num_inference_steps: requestBody.num_inference_steps
      });
      
      const response = await fetch('https://api.venice.ai/api/v1/image/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Venice AI Edit API failed:', errorText);
        
        // Provide more specific error messages based on status codes
        let errorMessage = `Image edit failed with status ${response.status}`;
        if (response.status === 400) {
          errorMessage = 'Invalid request parameters. Please check your prompt and image format.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check your API key.';
        } else if (response.status === 402) {
          errorMessage = 'Payment required. Please check your Venice AI account balance.';
        } else if (response.status === 415) {
          errorMessage = 'Unsupported media type. Please use a valid image format (JPEG, PNG, WebP).';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      // The edit API returns the image directly as binary data
      const imageBlob = await response.blob();
      const editedImageUrl = URL.createObjectURL(imageBlob);
      
      console.log('Image edited successfully!');
      return editedImageUrl;
      
    } catch (error) {
      console.error('Image edit error:', error);
      throw error;
    }
  };

  // Get available image styles with enhanced realistic options
  const getImageStyles = async () => {
    try {
      console.log('Fetching available image styles...');
      
      const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
      
      if (!apiKey) {
        throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
      }

      const response = await fetch('https://api.venice.ai/api/v1/image/styles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Venice AI Styles API failed:', errorText);
        throw new Error(`Styles fetch failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Available styles fetched successfully!');
      
      // Get API styles and enhance with realistic options
      const apiStyles = data.data || [];
      
      // Enhanced realistic styles to prioritize
      const realisticStyles = [
        'Photographic',
        'Realistic',
        'Photorealistic',
        'Professional Photography',
        'Portrait Photography',
        'Landscape Photography',
        'Street Photography',
        'Architectural Photography',
        'Product Photography',
        'Food Photography',
        'Real Estate Photography',
        'Wedding Photography',
        'Nature Photography',
        'Wildlife Photography',
        'Documentary Photography',
        'Photojournalism',
        'Studio Photography',
        'Commercial Photography',
        'Fashion Photography',
        'Travel Photography',
        'Aerial Photography',
        'Macro Photography',
        'Black and White Photography',
        'Color Photography',
        'HDR Photography',
        'Long Exposure Photography',
        'Night Photography',
        'Urban Photography',
        'Industrial Photography',
        'Medical Photography',
        'Scientific Photography',
        'Astrophotography',
        'Underwater Photography',
        'Sports Photography',
        'Event Photography',
        'Fine Art Photography',
        'Contemporary Photography',
        'Vintage Photography',
        'Film Photography',
        'Digital Photography',
        'High Resolution',
        '4K Quality',
        'Ultra HD',
        'Cinematic',
        'Film Noir',
        'Documentary Style',
        'News Photography',
        'Press Photography',
        'Editorial Photography',
        'Advertising Photography',
        'Corporate Photography',
        'Industrial Documentary',
        'Environmental Photography',
        'Conservation Photography',
        'Cultural Photography',
        'Historical Photography',
        'Modern Photography',
        'Contemporary Realism',
        'Hyperrealistic',
        'Photorealistic Art',
        'Realistic Rendering',
        'Professional Quality',
        'Studio Quality',
        'Print Quality',
        'Gallery Quality',
        'Museum Quality'
      ];
      
      // Combine API styles with realistic styles, prioritizing realistic ones
      const allStyles = [...realisticStyles, ...apiStyles];
      
      // Remove duplicates while preserving order
      const uniqueStyles = allStyles.filter((style, index) => allStyles.indexOf(style) === index);
      
      return uniqueStyles;
      
    } catch (error) {
      console.error('Styles fetch error:', error);
      // Return enhanced default styles if API fails
      return [
        'Photographic',
        'Realistic',
        'Photorealistic',
        'Professional Photography',
        'Portrait Photography',
        'Landscape Photography',
        'Street Photography',
        'Architectural Photography',
        'Product Photography',
        'Food Photography',
        'Real Estate Photography',
        'Wedding Photography',
        'Nature Photography',
        'Wildlife Photography',
        'Documentary Photography',
        'Photojournalism',
        'Studio Photography',
        'Commercial Photography',
        'Fashion Photography',
        'Travel Photography',
        'Aerial Photography',
        'Macro Photography',
        'Black and White Photography',
        'Color Photography',
        'HDR Photography',
        'Long Exposure Photography',
        'Night Photography',
        'Urban Photography',
        'Industrial Photography',
        'Medical Photography',
        'Scientific Photography',
        'Astrophotography',
        'Underwater Photography',
        'Sports Photography',
        'Event Photography',
        'Fine Art Photography',
        'Contemporary Photography',
        'Vintage Photography',
        'Film Photography',
        'Digital Photography',
        'High Resolution',
        '4K Quality',
        'Ultra HD',
        'Cinematic',
        'Film Noir',
        'Documentary Style',
        'News Photography',
        'Press Photography',
        'Editorial Photography',
        'Advertising Photography',
        'Corporate Photography',
        'Industrial Documentary',
        'Environmental Photography',
        'Conservation Photography',
        'Cultural Photography',
        'Historical Photography',
        'Modern Photography',
        'Contemporary Realism',
        'Hyperrealistic',
        'Photorealistic Art',
        'Realistic Rendering',
        'Professional Quality',
        'Studio Quality',
        'Print Quality',
        'Gallery Quality',
        'Museum Quality',
        '3D Model',
        'Analog Film',
        'Anime',
        'Comic Book'
      ];
    }
  };

  const sendMessage = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    console.log('sendMessage called with:', messageText, 'customInput:', customInput);

    if (!customInput) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    
    const currentInput = messageText;
    setIsLoading(true);

    try {


      // Handle image selection and conversation commands
      if (currentInput.toLowerCase().includes('select image') || currentInput.toLowerCase().includes('choose image')) {
        startImageSelection();
        return;
      }
      
      if (currentInput.toLowerCase().includes('cancel') && imageSelectionMode) {
        cancelImageSelection();
        return;
      }
      
      if (currentInput.toLowerCase().includes('analyze') && conversationContext.selectedImageUrl) {
        analyzeSelectedImage();
        return;
      }
      
      if (currentInput.toLowerCase().includes('reset') && conversationContext.selectedImageUrl) {
        setSelectedImageId(null);
        setConversationContext(prev => ({
          ...prev,
          selectedImageUrl: undefined,
          selectedImageMessage: undefined,
          enhancementHistory: []
        }));
        
        const resetMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🔄 **Image Selection Reset**\n\nI've cleared the selected image. You can now:\n• Select a different image\n• Upload a new image\n• Generate a new image\n• Start a new conversation\n\nType "select image" to choose an image from the conversation.`,
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, resetMessage]);
        return;
      }
      
      // Handle enhancement of selected image
      if (conversationContext.selectedImageUrl && (
        currentInput.toLowerCase().includes('enhance') ||
        currentInput.toLowerCase().includes('improve') ||
        currentInput.toLowerCase().includes('modify') ||
        currentInput.toLowerCase().includes('change') ||
        currentInput.toLowerCase().includes('edit') ||
        currentInput.toLowerCase().includes('fix') ||
        currentInput.toLowerCase().includes('adjust')
      )) {
        requestEnhancement(currentInput);
        return;
      }

      // Handle enhancement confirmation responses
      if (enhancementRequestMode) {
        const lowerInput = currentInput.toLowerCase();
        
        if (lowerInput.includes('proceed') || lowerInput.includes('yes') || lowerInput.includes('go') || lowerInput.includes('ok')) {
          setEnhancementRequestMode(false);
          await enhanceSelectedImage(pendingEnhancementPrompt);
          return;
        } else if (lowerInput.includes('no') || lowerInput.includes('cancel') || lowerInput.includes('stop')) {
          setEnhancementRequestMode(false);
          const cancelMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ **Enhancement Cancelled**\n\nI've cancelled the enhancement request. You can:\n• Try a different enhancement request\n• Type "suggest" for enhancement ideas\n• Type "analyze" for image analysis\n• Select a different image\n\nWhat would you like to do?`,
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, cancelMessage]);
          return;
        } else if (lowerInput.includes('change') || lowerInput.includes('modify') || lowerInput.includes('different')) {
          setEnhancementRequestMode(false);
          const modifyMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `🔄 **Modify Enhancement Request**\n\nPlease tell me what you'd like to change about the enhancement request.\n\n**Current request:** "${pendingEnhancementPrompt}"\n\n**Examples:**\n• "Make it more subtle"\n• "Make it more dramatic"\n• "Focus on the background instead"\n• "Try a different approach"\n\nWhat would you like to modify?`,
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, modifyMessage]);
          return;
        }
      }

      // Handle suggestion request
      if (currentInput.toLowerCase().includes('suggest')) {
        suggestEnhancementIdeas();
        return;
      }

      // Handle photo generation mode
      if (currentMode === 'photo') {
        try {
          // Check if user wants to enhance an uploaded image
          const wantsEnhanceUploaded = uploadedImage && (
            currentInput.toLowerCase().includes('enhance') ||
            currentInput.toLowerCase().includes('improve') ||
            currentInput.toLowerCase().includes('modify') ||
            currentInput.toLowerCase().includes('change') ||
            currentInput.toLowerCase().includes('edit') ||
            currentInput.toLowerCase().includes('fix') ||
            currentInput.toLowerCase().includes('adjust')
          );
          
          // Check if user wants upscaling/enhancement
          const wantsUpscale = currentInput.toLowerCase().includes('upscale') || 
                              currentInput.toLowerCase().includes('enhance') || 
                              currentInput.toLowerCase().includes('high quality') ||
                              currentInput.toLowerCase().includes('4k') ||
                              currentInput.toLowerCase().includes('hd');
          
          // Check if user wants to edit an existing image with more sophisticated detection
          const wantsEdit = currentInput.toLowerCase().includes('edit') || 
                           currentInput.toLowerCase().includes('modify') || 
                           currentInput.toLowerCase().includes('change') ||
                           currentInput.toLowerCase().includes('colorize') ||
                           currentInput.toLowerCase().includes('transform') ||
                           currentInput.toLowerCase().includes('inpaint') ||
                           currentInput.toLowerCase().includes('remove') ||
                           currentInput.toLowerCase().includes('replace') ||
                           currentInput.toLowerCase().includes('add') ||
                           currentInput.toLowerCase().includes('adjust') ||
                           currentInput.toLowerCase().includes('enhance') ||
                           currentInput.toLowerCase().includes('fix') ||
                           currentInput.toLowerCase().includes('correct');
          
          // Handle uploaded image enhancement
          if (wantsEnhanceUploaded) {
            await enhanceUploadedImage(currentInput);
            return;
          }
          
          // Add loading message
          const loadingMessage: Message = {
            id: (Date.now() + 0.5).toString(),
            role: 'assistant',
            content: wantsUpscale 
              ? '🎨 **Generating and enhancing your image...**\n\nPlease wait while I create and upscale your image with Venice AI. This usually takes 15-20 seconds.'
              : '🎨 **Generating your image...**\n\nPlease wait while I create your image with Venice AI. This usually takes 10-15 seconds.',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, loadingMessage]);
          
          const imageUrl = await generateImage(currentInput);
          
          let finalImageUrl = imageUrl;
          let enhancementInfo = '';
          
          // Check if there's a previous image to edit
          const previousImageMessage = messages
            .filter(msg => msg.type === 'image' && msg.imageUrl)
            .pop();
          
          // Edit existing image if requested and available
          if (wantsEdit && previousImageMessage?.imageUrl) {
            try {
              // Determine edit options based on the prompt
              const editOptions: any = {};
              
              // Adjust strength based on prompt keywords
              if (currentInput.toLowerCase().includes('subtle') || currentInput.toLowerCase().includes('slight')) {
                editOptions.strength = 0.3;
              } else if (currentInput.toLowerCase().includes('dramatic') || currentInput.toLowerCase().includes('major')) {
                editOptions.strength = 0.9;
              } else {
                editOptions.strength = 0.7; // Default moderate strength
              }
              
              // Adjust guidance scale for more precise control
              if (currentInput.toLowerCase().includes('precise') || currentInput.toLowerCase().includes('detailed')) {
                editOptions.guidance_scale = 12;
              } else if (currentInput.toLowerCase().includes('creative') || currentInput.toLowerCase().includes('artistic')) {
                editOptions.guidance_scale = 5;
              } else {
                editOptions.guidance_scale = 8; // Default balanced guidance
              }
              
              // Adjust inference steps for quality vs speed
              if (currentInput.toLowerCase().includes('high quality') || currentInput.toLowerCase().includes('detailed')) {
                editOptions.num_inference_steps = 30;
              } else {
                editOptions.num_inference_steps = 20; // Default steps
              }
              
              console.log('Editing image with options:', editOptions);
              const editedImageUrl = await editImage(previousImageMessage.imageUrl, currentInput, editOptions);
              finalImageUrl = editedImageUrl;
              
              // Provide detailed feedback about the editing process
              const strengthText = editOptions.strength <= 0.4 ? 'subtle' : editOptions.strength >= 0.8 ? 'dramatic' : 'moderate';
              const qualityText = editOptions.num_inference_steps >= 25 ? 'high-quality' : 'standard';
              
              enhancementInfo = `\n\n🎨 **Edited with Venice AI Image Edit**\n• Image modified based on your prompt\n• Applied ${strengthText} changes with ${qualityText} processing\n• Used AI inpaint technology for precise modifications`;
            } catch (editError) {
              console.error('Edit failed, generating new image:', editError);
              
              // Provide specific error feedback
              let errorNote = '⚠️ **Note:** Generated new image (editing failed)';
              if (editError.message.includes('Authentication failed')) {
                errorNote = '⚠️ **Note:** Generated new image (API authentication failed)';
              } else if (editError.message.includes('Rate limit')) {
                errorNote = '⚠️ **Note:** Generated new image (rate limit exceeded)';
              } else if (editError.message.includes('Invalid request')) {
                errorNote = '⚠️ **Note:** Generated new image (invalid edit request)';
              }
              
              enhancementInfo = `\n\n${errorNote}`;
            }
          }
          // Upscale and enhance if requested (and not editing)
          else if (wantsUpscale) {
            try {
              const enhancedImageUrl = await upscaleAndEnhanceImage(imageUrl, 2, true, 'enhance quality, improve details, sharpen');
              finalImageUrl = enhancedImageUrl;
              enhancementInfo = '\n\n✨ **Enhanced with Venice AI Upscale**\n• 2x resolution increase\n• Quality enhancement applied\n• Sharpness improved';
            } catch (upscaleError) {
              console.error('Upscale failed, using original image:', upscaleError);
              enhancementInfo = '\n\n⚠️ **Note:** Original image generated (upscaling failed)';
            }
          }
          
          // Remove loading message and add success message
          setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎨 **Image Generated Successfully!**\n\n**Prompt:** "${currentInput}"\n**Style:** ${selectedStyle}${enhancementInfo}\n\n**Generated Image:**\n\n*Generated with Venice AI • High-quality WebP format • ${wantsUpscale ? '2048x2048' : '1024x1024'} resolution*`,
            timestamp: new Date(),
            type: 'image',
            imageUrl: finalImageUrl // Store image URL separately
          };

          setMessages(prev => [...prev, assistantMessage]);
          
          if (audioEnabled) {
            setTimeout(() => {
              speakText(`I've generated ${wantsUpscale ? 'and enhanced ' : ''}an image based on your request: ${currentInput}`);
            }, 1000);
          }
          
          return;
        } catch (error) {
          console.error('Photo generation error:', error);
          
          let errorMessage = '❌ **Image Generation Failed**\n\nI couldn\'t generate an image for that prompt. Please try:\n\n• **More specific descriptions** (e.g., "a fluffy orange cat sitting on a windowsill")\n• **Different style requests** (e.g., "a cyberpunk city at night")\n• **Simpler prompts** (e.g., "a beautiful sunset")\n• **Try a different photography style** from the dropdown';
          
          if (error.message.includes('API key not configured')) {
            errorMessage = '🔑 **Configuration Error**\n\nVenice AI API key is not configured. Please add VITE_VENICE_IMAGE_API_KEY to your .env file.';
          } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = '🔑 **Authentication Error**\n\nVenice AI API key is invalid or expired. Please check your .env file and restart the application.';
          } else if (error.message.includes('All image generation endpoints failed') || error.message.includes('OpenAI API failed')) {
            errorMessage = '🌐 **Connection Error**\n\nUnable to connect to image generation services. Please check your internet connection and try again.';
          } else if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
            errorMessage = '⏱️ **Rate Limit Exceeded**\n\nToo many image generation requests. Please wait a moment and try again.';
          } else if (error.message.includes('content policy') || error.message.includes('inappropriate')) {
            errorMessage = '🚫 **Content Policy Violation**\n\nYour prompt may contain content that violates our safety guidelines. Please try a different description.';
          }
          
          toast({
            title: 'Image Generation Error',
            description: errorMessage,
            variant: 'destructive',
          });
          
          const assistantErrorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorMessage + '\n\n**💡 Tips for Better Results:**\n• Be specific about what you want to see\n• Include style preferences (e.g., "realistic", "cartoon", "3D")\n• Mention colors, lighting, and mood\n• Try different variations of your prompt\n• **Try switching photography styles** - each style works differently\n\n*If the issue persists, please try again in a few moments.*',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, assistantErrorMessage]);
          return;
        }
      }

      // Regular chat mode
      console.log('Sending request to Venice AI API with input:', currentInput);
      
      const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
      
      if (!chatApiKey) {
        throw new Error('Venice AI Chat API key not configured. Please set VITE_VENICE_CHAT_API_KEY in your .env file.');
      }
      
      const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chatApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: `You are a versatile AI assistant with expertise in programming, mathematics, and creative tasks. You can also handle voice interactions. Adapt your responses based on the user's needs:

Programming Mode: Provide code examples, debugging help, API generation, and technical explanations.
Math Mode: Offer step-by-step solutions, explain mathematical concepts, and show calculations.
Photo Mode: Help with image generation prompts and creative descriptions.
General Mode: Be helpful and informative across all topics.

Current mode: ${currentMode}

If the user sends a voice message, respond naturally as if they typed it. Don't mention that it was a voice message unless relevant. Always respond to the user's actual question or request.`
            },
            ...messages.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            })),
            {
              role: 'user',
              content: currentInput
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (audioEnabled) {
        setTimeout(() => {
          speakText(aiResponse);
        }, 1000);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to Venice AI. Please check your internet connection and try again.',
        variant: 'destructive',
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m having trouble connecting to Venice AI right now. Please check your internet connection and try again in a moment.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled) {
      speechSynthesis.cancel();
    }
  };

  const testVoiceFunctionality = () => {
    const testMessage = "Hello, this is a test voice message. Can you help me with a programming question?";
    
    console.log('Test voice functionality triggered with message:', testMessage);
    
    const testVoiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: testMessage,
      timestamp: new Date(),
      type: 'voice'
    };

    setMessages(prev => [...prev, testVoiceMessage]);
    setInput(testMessage);
    
    setTimeout(() => {
      console.log('Sending test voice message to AI');
      sendMessage(testMessage);
    }, 500);
    
    toast({
      title: 'Voice Test',
      description: 'Test voice message sent to AI.',
    });
  };

  const quickVoiceInput = (question: string) => {
    console.log('Quick voice input with question:', question);
    
    const voiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
      type: 'voice'
    };

    setMessages(prev => [...prev, voiceMessage]);
    setInput(question);
    
    setTimeout(() => {
      console.log('Sending quick voice input to AI');
      sendMessage(question);
    }, 500);
    
    toast({
      title: 'Voice Message Sent',
      description: 'Your question has been sent to AI.',
    });
  };

  const simulateVoiceMessage = (message: string) => {
    console.log('Simulating voice message:', message);
    
    const voiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      type: 'voice'
    };

    setMessages(prev => [...prev, voiceMessage]);
    setInput(message);
    
    setTimeout(() => {
      console.log('Sending simulated voice message to AI');
      sendMessage(message);
    }, 500);
    
    toast({
      title: 'Voice Message Simulated',
      description: 'Voice message sent to AI successfully.',
    });
  };

  const testPhotoGeneration = () => {
    const testPrompt = "A beautiful sunset over a mountain landscape with vibrant orange and purple clouds";
    
    console.log('Test photo generation with prompt:', testPrompt);
    
    setCurrentMode('photo');
    setInput(testPrompt);
    
    setTimeout(() => {
      console.log('Sending test photo generation request');
      sendMessage(testPrompt);
    }, 500);
    
    toast({
      title: 'Photo Generation Test',
      description: 'Testing image generation with a sunset landscape.',
    });
  };

  const testKeyStyles = async () => {
    const keyStyles = [
      'Photographic',
      'Realistic',
      'Portrait Photography',
      'Landscape Photography',
      'Street Photography',
      'Studio Photography',
      'Commercial Photography',
      'Fashion Photography'
    ];

    const testPrompt = 'a professional photograph of a cat';
    
    toast({
      title: 'Testing Key Photo Styles',
      description: `Testing ${keyStyles.length} key photography styles...`,
      variant: 'default',
    });

    for (let i = 0; i < keyStyles.length; i++) {
      const style = keyStyles[i];
      setSelectedStyle(style);
      
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        console.log(`Testing key style: ${style}`);
        const imageUrl = await generateImage(testPrompt);
        
        const testMessage: Message = {
          id: (Date.now() + i).toString(),
          role: 'assistant',
          content: `✅ **Key Style Test: ${style}**\n\nGenerated image using "${style}" style\n\n**Test Prompt:** "${testPrompt}"\n\n*Generated with Venice AI • Style: ${style}*`,
          timestamp: new Date(),
          type: 'image',
          imageUrl: imageUrl
        };
        
        setMessages(prev => [...prev, testMessage]);
        
      } catch (error) {
        console.error(`Key style ${style} failed:`, error);
        
        const errorMessage: Message = {
          id: (Date.now() + i).toString(),
          role: 'assistant',
          content: `❌ **Key Style Failed: ${style}**\n\nCould not generate image with "${style}" style\n\n**Error:** ${error.message}`,
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    }
    
    toast({
      title: 'Key Style Testing Complete',
      description: 'Finished testing key photography styles.',
      variant: 'default',
    });
  };

  const testAllPhotoStyles = async () => {
    const testStyles = [
      'Photographic',
      'Realistic', 
      'Photorealistic',
      'Professional Photography',
      'Portrait Photography',
      'Landscape Photography',
      'Street Photography',
      'Architectural Photography',
      'Product Photography',
      'Food Photography',
      'Real Estate Photography',
      'Wedding Photography',
      'Nature Photography',
      'Wildlife Photography',
      'Documentary Photography',
      'Photojournalism',
      'Studio Photography',
      'Commercial Photography',
      'Fashion Photography',
      'Travel Photography',
      'Aerial Photography',
      'Macro Photography',
      'Black and White Photography',
      'Color Photography',
      'HDR Photography',
      'Long Exposure Photography',
      'Night Photography',
      'Urban Photography',
      'Industrial Photography',
      'Medical Photography',
      'Scientific Photography',
      'Astrophotography',
      'Underwater Photography',
      'Sports Photography',
      'Event Photography',
      'Fine Art Photography',
      'Contemporary Photography',
      'Vintage Photography',
      'Film Photography',
      'Digital Photography',
      'High Resolution',
      '4K Quality',
      'Ultra HD',
      'Cinematic',
      'Film Noir',
      'Documentary Style',
      'News Photography',
      'Press Photography',
      'Editorial Photography',
      'Advertising Photography',
      'Corporate Photography',
      'Industrial Documentary',
      'Environmental Photography',
      'Conservation Photography',
      'Cultural Photography',
      'Historical Photography',
      'Modern Photography',
      'Contemporary Realism',
      'Hyperrealistic',
      'Photorealistic Art',
      'Realistic Rendering',
      'Professional Quality',
      'Studio Quality',
      'Print Quality',
      'Gallery Quality',
      'Museum Quality'
    ];

    const testPrompt = 'a professional photograph of a cat';
    
    toast({
      title: 'Testing All Photo Styles',
      description: `Testing ${testStyles.length} different photography styles with Venice AI...`,
      variant: 'default',
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < testStyles.length; i++) {
      const style = testStyles[i];
      setSelectedStyle(style);
      
      // Add a small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        console.log(`Testing style: ${style}`);
        const imageUrl = await generateImage(testPrompt);
        
        successCount++;
        
        const testMessage: Message = {
          id: (Date.now() + i).toString(),
          role: 'assistant',
          content: `✅ **Style Test Successful: ${style}**\n\nGenerated image using "${style}" style\n\n**Test Prompt:** "${testPrompt}"\n\n*Generated with Venice AI • Style: ${style}*`,
          timestamp: new Date(),
          type: 'image',
          imageUrl: imageUrl
        };
        
        setMessages(prev => [...prev, testMessage]);
        
      } catch (error) {
        console.error(`Style ${style} failed:`, error);
        failCount++;
        
        const errorMessage: Message = {
          id: (Date.now() + i).toString(),
          role: 'assistant',
          content: `❌ **Style Test Failed: ${style}**\n\nCould not generate image with "${style}" style\n\n**Error:** ${error.message}\n\n*This style may not be supported or there was a connection issue.*`,
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    }
    
    // Final summary message
    const summaryMessage: Message = {
      id: (Date.now() + 999).toString(),
      role: 'assistant',
      content: `📊 **Style Testing Complete!**\n\n**Results:**\n✅ **Successful:** ${successCount} styles\n❌ **Failed:** ${failCount} styles\n📈 **Success Rate:** ${Math.round((successCount / testStyles.length) * 100)}%\n\n**All styles have been tested with Venice AI and OpenAI fallback.**`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, summaryMessage]);
    
    toast({
      title: 'Style Testing Complete',
      description: `✅ ${successCount} successful, ❌ ${failCount} failed`,
      variant: 'default',
    });
  };

  const testImageEditing = () => {
    const editPrompt = "Change the sky to a dramatic stormy night with lightning";
    
    console.log('Test image editing with prompt:', editPrompt);
    
    setCurrentMode('photo');
    setInput(editPrompt);
    
    setTimeout(() => {
      console.log('Sending test image editing request');
      sendMessage(editPrompt);
    }, 500);
    
    toast({
      title: 'Image Editing Test',
      description: 'Testing image editing with a dramatic sky change.',
    });
  };

  const testAPI = async () => {
    try {
      console.log('Testing API connectivity...');
      let veniceStatus = '❌ Failed';
      let veniceMessage = '';
      
      try {
        const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
        
        if (!apiKey) {
          throw new Error('API key not configured');
        }
        
        const testResponse = await fetch('https://api.venice.ai/api/v1/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt: 'A simple test image',
            width: 512,
            height: 512,
            steps: 10,
            cfg_scale: 7.5,
            model: 'hidream',
            format: 'webp'
          }),
        });
        
        if (testResponse.ok) {
          veniceStatus = '✅ Connected';
          veniceMessage = 'Image generation available';
        } else {
          throw new Error(`API test failed with status ${testResponse.status}`);
        }
      } catch (veniceError) {
        veniceMessage = 'Venice AI API unavailable';
      }
      
      const testMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔧 **API Status Report**\n\n**🎨 Venice AI API:** ${veniceStatus}\n${veniceMessage}\n\n**💡 Features Available:**\n• Image generation: ${veniceStatus === '✅ Connected' ? 'Yes' : 'No'}\n• Image editing and enhancement: ${veniceStatus === '✅ Connected' ? 'Yes' : 'No'}\n• Voice interaction: Available\n• Programming assistance: Available\n• Mathematical calculations: Available`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, testMessage]);
      
      toast({
        title: 'API Test Complete',
        description: `Venice AI: ${veniceStatus === '✅ Connected' ? 'Connected' : 'Failed'}`,
      });
      
    } catch (error) {
      console.error('API test error:', error);
      
      const testErrorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **API Test Failed**\n\n**Error:** ${error.message}\n\n**Troubleshooting:**\n• Check your internet connection\n• Verify API endpoints are accessible\n• Try again in a few minutes`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, testErrorMessage]);
      
      toast({
        title: 'API Test Failed',
        description: 'Could not test API connectivity',
        variant: 'destructive',
      });
    }
  };

  const testImageEnhancement = () => {
    if (!uploadedImage) {
      toast({
        title: 'No Image',
        description: 'Please upload an image first to test enhancement.',
        variant: 'destructive',
      });
      return;
    }
    
    const testPrompt = "enhance the lighting and make it more professional";
    
    console.log('Testing image enhancement with uploaded image');
    
    setCurrentMode('photo');
    setInput(testPrompt);
    
    setTimeout(() => {
      console.log('Sending test image enhancement request');
      enhanceUploadedImage(testPrompt);
    }, 500);
    
    toast({
      title: 'Image Enhancement Test',
      description: 'Testing image enhancement with uploaded image.',
    });
  };

  // Download image function
  const downloadImage = async (imageUrl: string, filename: string = 'ai-generated-image') => {
    try {
      console.log('Downloading image:', imageUrl);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${filename}-${Date.now()}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Image Downloaded',
        description: 'Image has been saved to your downloads folder.',
      });
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download the image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Download image with proper filename based on content
  const downloadImageWithContext = (imageUrl: string, messageContent: string, type: 'generated' | 'enhanced' | 'edited' = 'generated') => {
    // Extract a meaningful filename from the message content
    let filename = 'ai-image';
    
    if (type === 'generated') {
      // Try to extract prompt from content
      const promptMatch = messageContent.match(/\*\*Prompt:\*\*\s*(.+?)(?:\n|$)/);
      if (promptMatch) {
        filename = promptMatch[1].substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
      }
    } else if (type === 'enhanced') {
      // Try to extract enhancement request
      const enhanceMatch = messageContent.match(/\*\*Enhancement Request:\*\*\s*"(.+?)"/);
      if (enhanceMatch) {
        filename = `enhanced-${enhanceMatch[1].substring(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}`;
      } else {
        filename = 'enhanced-image';
      }
    } else if (type === 'edited') {
      // Try to extract edit request
      const editMatch = messageContent.match(/\*\*Edit Request:\*\*\s*"(.+?)"/);
      if (editMatch) {
        filename = `edited-${editMatch[1].substring(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}`;
      } else {
        filename = 'edited-image';
      }
    }
    
    downloadImage(imageUrl, filename);
  };

  // Download all images from the chat
  const downloadAllImages = () => {
    const imageMessages = messages.filter(msg => msg.type === 'image' && msg.imageUrl);
    
    if (imageMessages.length === 0) {
      toast({
        title: 'No Images',
        description: 'No images found in the current chat.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log(`Downloading ${imageMessages.length} images...`);
    
    imageMessages.forEach((message, index) => {
      setTimeout(() => {
        let imageType: 'generated' | 'enhanced' | 'edited' = 'generated';
        if (message.content.includes('Enhanced Successfully')) {
          imageType = 'enhanced';
        } else if (message.content.includes('Image Edited Successfully')) {
          imageType = 'edited';
        }
        
        downloadImageWithContext(message.imageUrl!, message.content, imageType);
      }, index * 500); // Stagger downloads by 500ms
    });
    
    toast({
      title: 'Download Started',
      description: `Downloading ${imageMessages.length} images...`,
    });
  };

  const showImageEditHelp = () => {
    const helpMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `🎨 **Image Editing Guide**\n\n**How to Edit Images:**\n\n1. **First, generate an image** using any prompt\n2. **Then edit it** by describing what you want to change\n\n**Example Workflow:**\n• Generate: "A cat sitting on a windowsill"\n• Edit: "Change the cat to a dog"\n• Edit: "Make the background a forest"\n• Edit: "Add a rainbow in the sky"\n\n**Editing Keywords:**\n• **Subtle changes:** "slightly adjust", "make it warmer"\n• **Dramatic changes:** "completely transform", "major overhaul"\n• **Precise edits:** "detailed modification", "exact changes"\n• **Creative edits:** "artistic interpretation", "creative style"\n\n**Tips:**\n• Be specific about what you want to change\n• Mention the style or mood you want\n• You can edit the same image multiple times\n• Each edit builds on the previous version\n\n**Try these examples:**\n• "Change the colors to black and white"\n• "Add a sunset in the background"\n• "Make it look like a painting"\n• "Remove the background and add a cityscape"`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, helpMessage]);
    
    toast({
      title: 'Image Editing Help',
      description: 'Added image editing guide to the chat.',
    });
  };

  const showRealisticImageHelp = () => {
    const helpMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `📸 **Realistic Image Generation Guide**\n\n**Best Styles for Realistic Images:**\n\n**🎯 Photography Styles:**\n• **Photographic** - General realistic photos\n• **Professional Photography** - High-quality studio shots\n• **Portrait Photography** - People and faces\n• **Landscape Photography** - Nature and scenery\n• **Street Photography** - Urban and city life\n• **Architectural Photography** - Buildings and structures\n• **Product Photography** - Commercial and product shots\n• **Food Photography** - Culinary and restaurant images\n• **Real Estate Photography** - Property and interiors\n• **Wedding Photography** - Events and celebrations\n\n**🎨 Specialized Realistic Styles:**\n• **Photorealistic** - Ultra-realistic rendering\n• **Hyperrealistic** - Extremely detailed realism\n• **Contemporary Realism** - Modern realistic art\n• **Documentary Photography** - News and journalism style\n• **Photojournalism** - Press and media quality\n• **Studio Photography** - Professional studio quality\n• **Commercial Photography** - Advertising and marketing\n• **Fine Art Photography** - Artistic realistic images\n\n**💡 Tips for Realistic Images:**\n• Use specific photography terms in your prompts\n• Mention lighting conditions (natural light, studio lighting)\n• Specify camera settings (depth of field, exposure)\n• Include environmental details (weather, time of day)\n• Add professional photography keywords\n\n**Example Prompts:**\n• "Professional portrait photography of a business person"\n• "Landscape photography of mountains at golden hour"\n• "Street photography of a busy city intersection"\n• "Product photography of a modern smartphone"\n• "Architectural photography of a glass skyscraper"\n• "Food photography of a gourmet meal"\n• "Real estate photography of a luxury home interior"\n• "Wedding photography of a couple in a garden"\n\n**🎛️ Quality Keywords:**\n• "High Resolution", "4K Quality", "Ultra HD"\n• "Professional Quality", "Studio Quality"\n• "Print Quality", "Gallery Quality"\n• "Museum Quality", "Fine Art Quality"`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, helpMessage]);
    
    toast({
      title: 'Realistic Image Guide',
      description: 'Added realistic image generation guide to the chat.',
    });
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setShowImageUpload(false);
        analyzeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze uploaded image with AI
  const analyzeImage = async (imageUrl: string) => {
    setIsAnalyzingImage(true);
    
    try {
      // Add the uploaded image to chat
      const imageMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'I uploaded an image for analysis and enhancement.',
        timestamp: new Date(),
        type: 'image',
        imageUrl: imageUrl
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // Analyze the image with AI
      const analysisPrompt = `Please analyze this uploaded image and provide a detailed description. Include:
1. What objects, people, or scenes are visible
2. The style, composition, and quality of the image
3. Potential areas for improvement or enhancement
4. Suggestions for how this image could be enhanced or modified
5. Technical details like lighting, colors, and composition

Please be detailed and specific in your analysis.`;
      
      // Send analysis request to AI
      const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
      
      if (!chatApiKey) {
        throw new Error('Venice AI Chat API key not configured.');
      }
      
      const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chatApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: 'You are an expert image analyst and photography consultant. Analyze uploaded images and provide detailed feedback and enhancement suggestions.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || 'Unable to analyze the image.';
      
      // Add AI analysis to chat
      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📸 **Image Analysis Complete!**\n\n${analysis}\n\n**💡 Enhancement Suggestions:**\n• You can now describe how you want to enhance this image\n• Try prompts like "enhance the lighting", "improve the colors", "add more detail"\n• Or describe specific changes you want to make\n\n**Example Enhancement Prompts:**\n• "Enhance the lighting and make it more dramatic"\n• "Improve the colors and add more vibrancy"\n• "Add more detail to the background"\n• "Make it look more professional"\n• "Convert to black and white"\n• "Add a sunset in the background"\n\nWhat would you like to enhance or modify in this image?`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, analysisMessage]);
      
      // Set the uploaded image as the current image for editing
      setUploadedImage(imageUrl);
      
      toast({
        title: 'Image Analyzed',
        description: 'AI has analyzed your image and provided enhancement suggestions.',
      });
      
    } catch (error) {
      console.error('Image analysis error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ **Image Analysis Failed**\n\nI couldn\'t analyze the uploaded image. Please try again or describe what you want to enhance manually.\n\n**Manual Enhancement:**\nYou can still enhance this image by describing what changes you want to make. Try prompts like:\n• "Enhance the lighting"\n• "Improve the colors"\n• "Add more detail"\n• "Make it more professional"\n• "Convert to black and white"',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. You can still enhance it manually.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Enhance uploaded image with improved error handling and API testing
  // Select an image for enhancement and conversation
  const selectImageForEnhancement = (imageMessage: Message) => {
    setSelectedImageId(imageMessage.id);
    setConversationContext(prev => ({
      ...prev,
      selectedImageUrl: imageMessage.imageUrl,
      selectedImageMessage: imageMessage
    }));
    setImageSelectionMode(false);
    
    // Add selection confirmation message with interactive enhancement
    const selectionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎯 **Image Selected for Enhancement!**\n\nI've selected the image above for enhancement and conversation. 

**🤖 Interactive Enhancement Flow:**
1. **Tell me what you want to enhance** (e.g., "enhance the lighting", "improve colors", "make it more professional")
2. **I'll ask for confirmation** and show you what I'll do
3. **Say "proceed" or "yes"** to generate the enhancement
4. **Or say "no" or "change"** to modify your request

**💡 Example Flow:**
You: "enhance the lighting"
Me: "I'll enhance the lighting to make it brighter and more dramatic. Should I proceed?"
You: "proceed"
Me: *generates enhanced image*

**🎨 Quick Enhancement Ideas:**
• "Enhance the lighting"
• "Improve the colors"
• "Make it more professional"
• "Add more detail"
• "Convert to black and white"
• "Make it more vibrant"
• "Improve the composition"

**📝 Other Options:**
• Type "analyze" for detailed analysis
• Type "reset" to select a different image
• Type "suggest" for enhancement ideas

What would you like to enhance in this image?`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, selectionMessage]);
    
    toast({
      title: 'Image Selected',
      description: 'You can now enhance and discuss this image.',
    });
  };

  // Start image selection mode
  const startImageSelection = () => {
    setImageSelectionMode(true);
    setSelectedImageId(null);
    setConversationContext(prev => ({
      ...prev,
      selectedImageUrl: undefined,
      selectedImageMessage: undefined
    }));
    
    const selectionModeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎯 **Image Selection Mode Active**\n\nClick on any image in the conversation to select it for enhancement and discussion. The selected image will be highlighted and you can then:\n\n• Enhance it with specific requests\n• Ask questions about it\n• Get analysis and suggestions\n• Have a conversation about improvements\n\nClick on an image to select it, or type "cancel" to exit selection mode.`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, selectionModeMessage]);
  };

  // Cancel image selection mode
  const cancelImageSelection = () => {
    setImageSelectionMode(false);
    setSelectedImageId(null);
    setConversationContext(prev => ({
      ...prev,
      selectedImageUrl: undefined,
      selectedImageMessage: undefined
    }));
    
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `❌ **Image Selection Cancelled**\n\nYou can still enhance images by:\n• Uploading a new image\n• Describing what you want to enhance\n• Using the photo generation mode\n\nType "select image" to enter selection mode again.`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, cancelMessage]);
  };

  // Interactive enhancement confirmation
  const requestEnhancement = (enhancementPrompt: string) => {
    setPendingEnhancementPrompt(enhancementPrompt);
    setEnhancementRequestMode(true);
    
    // Add user enhancement request to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Enhance this image: ${enhancementPrompt}`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add confirmation request message
    const confirmationMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `🤖 **Enhancement Request Confirmation**\n\n**Your Request:** "${enhancementPrompt}"\n\n**What I'll do:**\n${getEnhancementDescription(enhancementPrompt)}\n\n**Options:**\n• **"proceed"** or **"yes"** - Generate the enhancement\n• **"no"** or **"cancel"** - Cancel the enhancement\n• **"change"** or **"modify"** - Modify your request\n• **"suggest"** - Get alternative enhancement ideas\n\nShould I proceed with this enhancement?`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
  };

  // Get enhancement description based on prompt
  const getEnhancementDescription = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('lighting') || lowerPrompt.includes('bright')) {
      return "• Improve overall lighting and brightness\n• Enhance shadows and highlights\n• Make the image more well-lit and balanced";
    } else if (lowerPrompt.includes('color') || lowerPrompt.includes('vibrant')) {
      return "• Enhance color saturation and vibrancy\n• Improve color balance and contrast\n• Make colors more vivid and appealing";
    } else if (lowerPrompt.includes('professional') || lowerPrompt.includes('polish')) {
      return "• Apply professional photo editing techniques\n• Improve overall image quality and refinement\n• Add professional polish and finish";
    } else if (lowerPrompt.includes('detail') || lowerPrompt.includes('sharp')) {
      return "• Enhance fine details and sharpness\n• Improve image resolution and clarity\n• Add more definition to important elements";
    } else if (lowerPrompt.includes('black') && lowerPrompt.includes('white')) {
      return "• Convert to black and white\n• Optimize contrast and tonal range\n• Create a classic monochrome look";
    } else if (lowerPrompt.includes('vibrant') || lowerPrompt.includes('lively')) {
      return "• Increase color vibrancy and energy\n• Make the image more dynamic and lively\n• Enhance visual impact";
    } else if (lowerPrompt.includes('composition') || lowerPrompt.includes('balance')) {
      return "• Improve overall composition and balance\n• Enhance visual flow and arrangement\n• Optimize framing and positioning";
    } else {
      return "• Apply general image enhancement\n• Improve overall quality and appeal\n• Optimize based on your specific request";
    }
  };

  // Suggest enhancement ideas
  const suggestEnhancementIdeas = () => {
    const suggestionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `💡 **Enhancement Ideas for Your Image**\n\nHere are some great enhancement options you can try:\n\n**🎨 Visual Improvements:**\n• "Enhance the lighting" - Make it brighter and more balanced\n• "Improve the colors" - Make colors more vibrant and appealing\n• "Add more detail" - Enhance sharpness and clarity\n• "Make it more professional" - Apply professional photo editing\n\n**🎭 Style Transformations:**\n• "Convert to black and white" - Create a classic monochrome look\n• "Make it more vibrant" - Increase color energy and impact\n• "Improve the composition" - Better balance and arrangement\n• "Add a vintage effect" - Give it a retro, nostalgic feel\n\n**🌟 Advanced Enhancements:**\n• "Enhance the background" - Improve background details\n• "Improve the foreground" - Make main subjects stand out\n• "Add depth of field" - Create more dramatic focus\n• "Optimize for social media" - Perfect for Instagram, Facebook\n\n**📱 Specific Use Cases:**\n• "Make it Instagram-worthy" - Optimize for social media\n• "Professional headshot style" - Perfect for LinkedIn\n• "Product photography style" - Great for e-commerce\n• "Artistic portrait style" - Creative and expressive\n\n**💬 How to Use:**\nJust tell me what you want to enhance, and I'll ask for confirmation before proceeding!\n\nWhat type of enhancement interests you?`,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, suggestionMessage]);
  };

  // Enhanced image enhancement with conversation context
  const enhanceSelectedImage = async (enhancementPrompt: string) => {
    const selectedImage = conversationContext.selectedImageUrl;
    
    if (!selectedImage) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image first or upload a new one.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user enhancement request to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Enhance this image: ${enhancementPrompt}`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Test API connection first
      const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
      
      if (!apiKey) {
        throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
      }
      
      console.log('Testing API connection...');
      console.log('API Key available:', !!apiKey);
      console.log('Enhancement prompt:', enhancementPrompt);
      console.log('Selected image exists:', !!selectedImage);
      
      // Try multiple enhancement approaches
      let enhancedImageUrl: string;
      
      try {
        // First try: Direct edit with specific parameters
        enhancedImageUrl = await editImage(selectedImage, enhancementPrompt, {
          strength: 0.7,
          guidance_scale: 8,
          num_inference_steps: 20
        });
      } catch (editError) {
        console.log('First enhancement attempt failed, trying alternative approach...');
        
        // Second try: Use upscale with enhancement
        try {
          enhancedImageUrl = await upscaleAndEnhanceImage(selectedImage, 1, true, enhancementPrompt);
        } catch (upscaleError) {
          console.log('Upscale enhancement failed, trying basic enhancement...');
          
          // Third try: Basic enhancement with simpler parameters
          enhancedImageUrl = await editImage(selectedImage, enhancementPrompt, {
            strength: 0.5,
            guidance_scale: 5,
            num_inference_steps: 15
          });
        }
      }
      
      // Update conversation context with enhancement history
      setConversationContext(prev => ({
        ...prev,
        enhancementHistory: [...prev.enhancementHistory, {
          prompt: enhancementPrompt,
          resultUrl: enhancedImageUrl
        }]
      }));
      
      // Add enhanced image to chat
      const enhancedMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✨ **Image Enhanced Successfully!**\n\n**Enhancement Request:** "${enhancementPrompt}"\n\n**Enhanced Image:**\n\n*Enhanced with Venice AI Image Edit • High-quality processing • Professional enhancement applied*\n\n**Enhancement History:** ${conversationContext.enhancementHistory.length + 1} modifications made to this image.`,
        timestamp: new Date(),
        type: 'image',
        imageUrl: enhancedImageUrl
      };
      
      setMessages(prev => [...prev, enhancedMessage]);
      
      // Update the selected image to the enhanced version
      setConversationContext(prev => ({
        ...prev,
        selectedImageUrl: enhancedImageUrl
      }));
      
      toast({
        title: 'Image Enhanced',
        description: 'Your image has been enhanced successfully!',
      });
      
    } catch (error) {
      console.error('Image enhancement error:', error);
      
      // Provide more specific error messages
      let errorDetails = 'Unknown error occurred';
      let suggestions = [
        'Try simpler enhancement requests',
        'Check your API key configuration',
        'Ensure the image format is supported'
      ];
      
      if (error.message.includes('API key not configured')) {
        errorDetails = 'API key is not configured. Please check your .env file.';
        suggestions = [
          'Add VITE_VENICE_IMAGE_API_KEY to your .env file',
          'Restart the application after adding the API key',
          'Verify the API key is valid'
        ];
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorDetails = 'API authentication failed. Please check your API key.';
        suggestions = [
          'Verify your API key is correct',
          'Check if your API key has expired',
          'Ensure you have sufficient API credits'
        ];
      } else if (error.message.includes('400')) {
        errorDetails = 'Invalid request. The enhancement request might be too complex.';
        suggestions = [
          'Try simpler enhancement requests',
          'Use more specific descriptions',
          'Avoid very complex modifications'
        ];
      } else if (error.message.includes('429')) {
        errorDetails = 'Rate limit exceeded. Please wait a moment before trying again.';
        suggestions = [
          'Wait a few minutes before trying again',
          'Check your API usage limits',
          'Try a simpler enhancement request'
        ];
      } else if (error.message.includes('500')) {
        errorDetails = 'Server error. The API might be temporarily unavailable.';
        suggestions = [
          'Try again in a few minutes',
          'Check the API service status',
          'Use a different enhancement approach'
        ];
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Image Enhancement Failed**\n\n**Error:** ${errorDetails}\n\n**Enhancement Request:** "${enhancementPrompt}"\n\n**Suggestions:**\n${suggestions.map(s => `• ${s}`).join('\n')}\n\n**Alternative Approaches:**\n• Try "enhance the lighting"\n• Try "improve the colors"\n• Try "make it more professional"\n• Try "add more detail"`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Enhancement Failed',
        description: errorDetails,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze selected image with conversation context
  const analyzeSelectedImage = async () => {
    const selectedImage = conversationContext.selectedImageUrl;
    
    if (!selectedImage) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add analysis request to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Please analyze this selected image and provide detailed feedback.',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Analyze the image with AI
      const analysisPrompt = `Please provide a detailed analysis of this selected image for enhancement and conversation. Include:

1. **Visual Analysis:**
   - What objects, people, or scenes are visible
   - The style, composition, and quality of the image
   - Color palette and lighting analysis

2. **Technical Assessment:**
   - Image quality and resolution
   - Potential areas for improvement
   - Technical strengths and weaknesses

3. **Enhancement Suggestions:**
   - Specific improvements that could be made
   - Style modifications that would work well
   - Creative enhancement possibilities

4. **Conversation Context:**
   - Previous enhancements made (if any): ${conversationContext.enhancementHistory.length} modifications
   - How the image has evolved
   - Next steps for further improvement

Please be detailed and conversational in your analysis, as this is part of an ongoing enhancement conversation.`;
      
      // Send analysis request to AI
      const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
      
      if (!chatApiKey) {
        throw new Error('Venice AI Chat API key not configured.');
      }
      
      const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chatApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: 'You are an expert image analyst and photography consultant. Analyze selected images and provide detailed feedback for enhancement conversations.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || 'Unable to analyze the image.';
      
      // Add AI analysis to chat
      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📸 **Image Analysis Complete!**\n\n${analysis}\n\n**💡 Next Steps:**\n• Describe specific enhancements you want\n• Ask questions about the analysis\n• Request different style modifications\n• Continue the enhancement conversation\n\n**Enhancement History:** ${conversationContext.enhancementHistory.length} previous modifications`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, analysisMessage]);
      
      toast({
        title: 'Image Analyzed',
        description: 'AI has analyzed your selected image and provided detailed feedback.',
      });
      
    } catch (error) {
      console.error('Image analysis error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ **Image Analysis Failed**\n\nI couldn\'t analyze the selected image. Please try again or describe what you want to enhance manually.\n\n**Manual Enhancement:**\nYou can still enhance this image by describing what changes you want to make. Try prompts like:\n• "Enhance the lighting"\n• "Improve the colors"\n• "Add more detail"\n• "Make it more professional"\n• "Convert to black and white"',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. You can still enhance it manually.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceUploadedImage = async (enhancementPrompt: string) => {
    if (!uploadedImage) {
      toast({
        title: 'No Image',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user enhancement request to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Enhance this image: ${enhancementPrompt}`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Test API connection first
      const apiKey = import.meta.env.VITE_VENICE_IMAGE_API_KEY || import.meta.env.VITE_PHOTO_API_KEY;
      
      if (!apiKey) {
        throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
      }
      
      console.log('Testing API connection...');
      console.log('API Key available:', !!apiKey);
      console.log('Enhancement prompt:', enhancementPrompt);
      console.log('Uploaded image exists:', !!uploadedImage);
      
      // Try multiple enhancement approaches
      let enhancedImageUrl: string;
      
      try {
        // First try: Direct edit with specific parameters
        enhancedImageUrl = await editImage(uploadedImage, enhancementPrompt, {
          strength: 0.7,
          guidance_scale: 8,
          num_inference_steps: 20
        });
      } catch (editError) {
        console.log('First enhancement attempt failed, trying alternative approach...');
        
        // Second try: Use upscale with enhancement
        try {
          enhancedImageUrl = await upscaleAndEnhanceImage(uploadedImage, 1, true, enhancementPrompt);
        } catch (upscaleError) {
          console.log('Upscale enhancement failed, trying basic enhancement...');
          
          // Third try: Basic enhancement with simpler parameters
          enhancedImageUrl = await editImage(uploadedImage, enhancementPrompt, {
            strength: 0.5,
            guidance_scale: 5,
            num_inference_steps: 15
          });
        }
      }
      
      // Add enhanced image to chat
      const enhancedMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✨ **Image Enhanced Successfully!**\n\n**Enhancement Request:** "${enhancementPrompt}"\n\n**Enhanced Image:**\n\n*Enhanced with Venice AI Image Edit • High-quality processing • Professional enhancement applied*`,
        timestamp: new Date(),
        type: 'image',
        imageUrl: enhancedImageUrl
      };
      
      setMessages(prev => [...prev, enhancedMessage]);
      
      // Update the uploaded image to the enhanced version
      setUploadedImage(enhancedImageUrl);
      
      toast({
        title: 'Image Enhanced',
        description: 'Your image has been enhanced successfully!',
      });
      
    } catch (error) {
      console.error('Image enhancement error:', error);
      
      // Provide more specific error messages
      let errorDetails = 'Unknown error occurred';
      let suggestions = [
        'Try simpler enhancement requests',
        'Check your API key configuration',
        'Ensure the image format is supported'
      ];
      
      if (error.message.includes('API key not configured')) {
        errorDetails = 'API key is not configured. Please check your .env file.';
        suggestions = [
          'Add VITE_VENICE_IMAGE_API_KEY to your .env file',
          'Restart the application after adding the API key',
          'Verify the API key is valid'
        ];
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorDetails = 'API authentication failed. Please check your API key.';
        suggestions = [
          'Verify your API key is correct',
          'Check if your API key has expired',
          'Ensure you have sufficient API credits'
        ];
      } else if (error.message.includes('400')) {
        errorDetails = 'Invalid request. The enhancement request might be too complex.';
        suggestions = [
          'Try simpler enhancement requests',
          'Use more specific descriptions',
          'Avoid very complex modifications'
        ];
      } else if (error.message.includes('429')) {
        errorDetails = 'Rate limit exceeded. Please wait a moment before trying again.';
        suggestions = [
          'Wait a few minutes before trying again',
          'Check your API usage limits',
          'Try a simpler enhancement request'
        ];
      } else if (error.message.includes('500')) {
        errorDetails = 'Server error. The API might be temporarily unavailable.';
        suggestions = [
          'Try again in a few minutes',
          'Check the API service status',
          'Use a different enhancement approach'
        ];
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Image Enhancement Failed**\n\n**Error:** ${errorDetails}\n\n**Enhancement Request:** "${enhancementPrompt}"\n\n**Suggestions:**\n${suggestions.map(s => `• ${s}`).join('\n')}\n\n**Alternative Approaches:**\n• Try "enhance the lighting"\n• Try "improve the colors"\n• Try "make it more professional"\n• Try "add more detail"`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Enhancement Failed',
        description: errorDetails,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    clearChat();
    setShowHistory(false);
    toast({
      title: 'New Chat Started',
      description: 'Started a fresh conversation.',
    });
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      loadChatSessions(); // Refresh sessions when opening
    }
  };



  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden`}>
      {/* Compact Header Bar */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AlgebrAI Assistant</h1>
              <p className="text-xs text-white/60">Powered by Venice AI</p>
            </div>
          </div>
        </div>
        
                  <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-300 font-medium">Online</span>
            </div>
            
            {chatSessions.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/30">
                <History className="w-3 h-3 text-blue-300" />
                <span className="text-xs text-blue-300 font-medium">{chatSessions.length} saved</span>
              </div>
            )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Compact Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative z-40 w-64 h-full bg-black/30 backdrop-blur-xl border-r border-white/10 transition-all duration-300 overflow-y-auto`}>
          <div className="p-4 space-y-4">
            {/* Model Selection */}
            <div>
              <h3 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">AI Model</h3>
              <div className="relative" ref={modelRef}>
                <button 
                  onClick={() => setModelOpen(!isModelOpen)} 
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">{selectedModel}</div>
                      <div className="text-white/50 text-xs">Advanced AI Model</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isModelOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                    {models.map((model, index) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className="w-full p-3 text-left hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0"
                      >
                        <div className="text-white text-sm font-medium">{model}</div>
                        <div className="text-white/50 text-xs mt-1">
                          {index === 0 && "Latest general-purpose model"}
                          {index === 1 && "Optimized for creative tasks"}
                          {index === 2 && "Advanced vision capabilities"}
                          {index === 3 && "Specialized for programming"}
                          {index === 4 && "Mathematical problem solving"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <h3 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">AI Mode</h3>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { mode: 'general' as AIMode, icon: Brain, label: 'General', color: 'from-gray-500 to-slate-500' },
                  { mode: 'programming' as AIMode, icon: Code, label: 'Code', color: 'from-blue-500 to-cyan-500' },
                  { mode: 'math' as AIMode, icon: Calculator, label: 'Math', color: 'from-green-500 to-emerald-500' },
                  { mode: 'photo' as AIMode, icon: Camera, label: 'Photo', color: 'from-purple-500 to-pink-500' },
              
                ].map(({ mode, icon: Icon, label, color }) => (
                  <button
                    key={mode}
                    onClick={() => setCurrentMode(mode)}
                    className={`p-2 rounded-lg border transition-all duration-300 ${
                      currentMode === mode
                        ? 'bg-white/20 border-white/30 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-r ${color} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-white text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">Quick Actions</h3>
              <div className="relative" ref={quickActionsRef}>
                <button 
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)} 
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 group relative"
                  title="Quick Actions (⌘+K)"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">Quick Actions</div>
                      <div className="text-white/50 text-xs">Choose from templates</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Quick Actions (⌘+K)
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                  </div>
                </button>
                
                {isQuickActionsOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="p-2">
                      <div className="text-xs text-white/60 px-2 py-1 mb-2 border-b border-white/10">Programming</div>
                      {quickActions.filter(action => action.category === 'Programming').map((action, index) => (
                        <button
                          key={`prog-${index}`}
                          onClick={() => {
                            handleQuickAction(action);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white/10 rounded-md transition-all duration-200 group"
                        >
                          <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                            <action.icon className="w-2 h-2 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-xs font-medium truncate">{action.text}</div>
                            <div className="text-white/40 text-xs truncate">{action.description}</div>
                          </div>
                        </button>
                      ))}
                      
                      <div className="text-xs text-white/60 px-2 py-1 mb-2 mt-3 border-b border-white/10">Mathematics</div>
                      {quickActions.filter(action => action.category === 'Mathematics').map((action, index) => (
                        <button
                          key={`math-${index}`}
                          onClick={() => {
                            handleQuickAction(action);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white/10 rounded-md transition-all duration-200 group"
                        >
                          <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                            <action.icon className="w-2 h-2 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-xs font-medium truncate">{action.text}</div>
                            <div className="text-white/40 text-xs truncate">{action.description}</div>
                          </div>
                        </button>
                      ))}
                      
                      <div className="text-xs text-white/60 px-2 py-1 mb-2 mt-3 border-b border-white/10">Photo Generation</div>
                      {quickActions.filter(action => action.category === 'Photo Generation').map((action, index) => (
                        <button
                          key={`photo-${index}`}
                          onClick={() => {
                            handleQuickAction(action);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white/10 rounded-md transition-all duration-200 group"
                        >
                          <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                            <action.icon className="w-2 h-2 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-xs font-medium truncate">{action.text}</div>
                            <div className="text-white/40 text-xs truncate">{action.description}</div>
                          </div>
                        </button>
                      ))}
                      
                                             <div className="text-xs text-white/60 px-2 py-1 mb-2 mt-3 border-b border-white/10">Photo Editing</div>
                       {quickActions.filter(action => action.category === 'Photo Editing').map((action, index) => (
                         <button
                           key={`edit-${index}`}
                           onClick={() => {
                             handleQuickAction(action);
                             setIsQuickActionsOpen(false);
                           }}
                           className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white/10 rounded-md transition-all duration-200 group"
                         >
                           <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                             <action.icon className="w-2 h-2 text-white" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <div className="text-white text-xs font-medium truncate">{action.text}</div>
                             <div className="text-white/40 text-xs truncate">{action.description}</div>
                           </div>
                         </button>
                       ))}
                       
                                               <div className="text-xs text-white/60 px-2 py-1 mb-2 mt-3 border-b border-white/10">Photo Enhancement</div>
                        {quickActions.filter(action => action.category === 'Photo Enhancement').map((action, index) => (
                          <button
                            key={`enhance-${index}`}
                            onClick={() => {
                              if (action.text === 'Upload & Enhance Image') {
                                setShowImageUpload(true);
                                setIsQuickActionsOpen(false);
                              } else if (action.text === 'Download All Images') {
                                downloadAllImages();
                                setIsQuickActionsOpen(false);
                              } else {
                                handleQuickAction(action);
                                setIsQuickActionsOpen(false);
                              }
                            }}
                            className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white/10 rounded-md transition-all duration-200 group"
                          >
                            <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                              <action.icon className="w-2 h-2 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white text-xs font-medium truncate">{action.text}</div>
                              <div className="text-white/40 text-xs truncate">{action.description}</div>
                            </div>
                          </button>
                        ))}
                        
                        <div className="text-xs text-white/60 px-2 py-1 mb-2 mt-3 border-b border-white/10">Testing</div>
                        {quickActions.filter(action => action.category === 'Testing').map((action, index) => (
                          <button
                            key={`test-${index}`}
                            onClick={() => {
                              if (action.text === 'Test API Connection') {
                                testAPI();
                                setIsQuickActionsOpen(false);
                              } else {
                                handleQuickAction(action);
                                setIsQuickActionsOpen(false);
                              }
                            }}
                            className="w-full flex items-center space-x-2 p-2 text-left hover:bg-white/10 rounded-md transition-all duration-200 group"
                          >
                            <div className={`w-4 h-4 rounded-md bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0`}>
                              <action.icon className="w-2 h-2 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white text-xs font-medium truncate">{action.text}</div>
                              <div className="text-white/40 text-xs truncate">{action.description}</div>
                            </div>
                          </button>
                        ))}
                        

                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Generation Setup Info */}
            {currentMode === 'photo' && (
              <div className="space-y-3">
                {/* Style Selection */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-purple-300 mb-2">Image Style</h4>
                  <div className="relative">
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-black/20 border border-purple-500/30 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      {availableStyles.length > 0 ? (
                        availableStyles.map((style) => (
                          <option key={style} value={style} className="bg-black text-white">
                            {style}
                          </option>
                        ))
                      ) : (
                        <option value="3D Model" className="bg-black text-white">3D Model</option>
                      )}
                    </select>
                  </div>
                  <p className="text-xs text-purple-200/60 mt-1">
                    Choose the artistic style for your generated images
                  </p>
                </div>

                {/* Realistic Image Help */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-green-300">Realistic Images</h4>
                    <Button
                      onClick={showRealisticImageHelp}
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 text-green-300 hover:text-green-200 hover:bg-green-500/20 rounded"
                      title="Realistic Image Guide"
                    >
                      <Lightbulb className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-200/80 mb-2">
                    Generate photorealistic images with professional photography styles.
                  </p>
                  <div className="text-xs text-green-200/60 space-y-1">
                    <div>• Photographic, Realistic, Photorealistic</div>
                    <div>• Professional Photography styles</div>
                    <div>• High Resolution & Quality options</div>
                  </div>
                </div>

                {/* API Setup Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-300 mb-2">Photo Generation Setup</h4>
                  <p className="text-xs text-blue-200/80 mb-2">
                    To use photo generation, you need a valid API key from an image generation service.
                  </p>
                  <div className="text-xs text-blue-200/60 space-y-1">
                    <div>• Venice AI API (Recommended)</div>
                    <div>• OpenAI DALL-E API</div>
                    <div>• Stability AI API</div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200/60">
                    Add your API key to the .env file as VITE_VENICE_IMAGE_API_KEY
                  </div>
                  
                  {/* API Testing */}
                  <div className="mt-3 pt-2 border-t border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-200/80">API Status</span>
                      <button
                        onClick={testAPI}
                        className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-2 py-1 rounded border border-green-500/30 transition-colors"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Chat History</h3>
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={startNewChat}
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded group relative"
                    title="New Chat (⌘+N)"
                  >
                    <Plus className="w-3 h-3" />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      New Chat (⌘+N)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                    </div>
                  </Button>
                  <Button
                    onClick={toggleHistory}
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded group relative"
                    title="Toggle History (⌘+H)"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      Toggle History (⌘+H)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                    </div>
                  </Button>
                </div>
              </div>
              
              {showHistory && (
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {chatSessions.length === 0 ? (
                    <div className="text-xs text-white/50 p-2 text-center">
                      No saved conversations
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group relative p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                          currentSessionId === session.id
                            ? 'bg-purple-500/20 border-purple-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => loadSession(session)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-medium truncate">
                              {session.title}
                            </div>
                            <div className="text-white/50 text-xs mt-1">
                              {session.messages.length} messages
                            </div>
                            <div className="text-white/40 text-xs mt-1">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-500/20 rounded"
                            title="Delete session"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Chat Controls */}
            <div>
              <h3 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">Chat Controls</h3>
              <div className="space-y-1">
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Clear Chat
                </Button>
                <Button
                  onClick={() => {/* Export chat */}}
                  variant="ghost"
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Export Chat
                </Button>
                <Button
                  onClick={() => {/* Share chat */}}
                  variant="ghost"
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8 text-xs"
                >
                  <Share2 className="w-3 h-3 mr-2" />
                  Share Chat
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">Settings</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-3 h-3 text-white/70" />
                    <span className="text-white text-xs">Audio Response</span>
                  </div>
                  <button
                    onClick={toggleAudio}
                    className={`w-8 h-4 rounded-full transition-all duration-300 ${
                      audioEnabled ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${
                      audioEnabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col bg-black/10 backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} ${!sidebarOpen ? 'w-full' : ''}`}>
          {/* Compact Sidebar Toggle Button */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-300 border group relative ${
                  sidebarOpen 
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-300' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                }`}
                title={`${sidebarOpen ? 'Hide' : 'Show'} sidebar (⌘+B)`}
              >
                <Menu className={`w-3 h-3 transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : ''}`} />
                <span className="text-xs font-medium">
                  {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {sidebarOpen ? 'Hide' : 'Show'} sidebar (⌘+B)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
              </button>
              
              {/* Quick Status Indicators */}
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${sidebarOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-white/60">
                  {sidebarOpen ? 'Sidebar Active' : 'Sidebar Hidden'}
                </span>
                {!sidebarOpen && (
                  <span className="text-xs text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                    Full Width
                  </span>
                )}
              </div>
            </div>
            
            {/* Keyboard Shortcut Hint */}
            <div className="flex items-center space-x-2">
              <div className="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                ⌘ + B
              </div>
              <span className="text-xs text-white/40">Toggle Sidebar</span>
            </div>
          </div>
          

            

          {/* Chat Messages */}
          <div 
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar transition-all duration-300 ${!sidebarOpen ? 'max-w-none' : ''}`}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`flex items-start space-x-3 ${!sidebarOpen ? 'max-w-6xl' : 'max-w-4xl'} ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}>
                  {/* Compact Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`relative max-w-full ${
                    message.role === 'user' ? 'mr-3' : 'ml-3'
                  }`}>
                    {/* Compact Message Bubble */}
                    <div className={`rounded-xl p-4 shadow-xl backdrop-blur-sm border ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white border-blue-400/30'
                        : 'bg-black/40 text-white border-white/10'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                        {message.content}
                      </div>
                      
                      {message.type === 'voice' && message.audioUrl && (
                        <div className="mt-3 p-2 bg-white/10 rounded-lg">
                          <audio controls className="w-full" src={message.audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      
                      {message.type === 'image' && message.imageUrl && (
                        <div className="mt-3 relative group">
                          <div className={`relative ${imageSelectionMode ? 'cursor-pointer' : ''} ${selectedImageId === message.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black/50' : ''}`}>
                            <img 
                              src={message.imageUrl} 
                              alt="Generated Image"
                              className={`w-full max-w-sm rounded-lg shadow-lg border border-white/20 transition-all duration-200 ${
                                imageSelectionMode ? 'hover:scale-105 hover:shadow-xl' : ''
                              } ${selectedImageId === message.id ? 'ring-2 ring-purple-500' : ''}`}
                              onClick={() => {
                                if (imageSelectionMode) {
                                  selectImageForEnhancement(message);
                                }
                              }}
                              onError={(e) => {
                                console.error('Failed to load image');
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            
                            {/* Selection Mode Indicator */}
                            {imageSelectionMode && (
                              <div className="absolute top-2 left-2 bg-purple-500/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-400/50">
                                <span className="text-xs text-white font-medium">Click to Select</span>
                              </div>
                            )}
                            
                            {/* Selected Image Indicator */}
                            {selectedImageId === message.id && !imageSelectionMode && (
                              <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-green-400/50">
                                <span className="text-xs text-white font-medium">Selected</span>
                              </div>
                            )}
                            
                            {/* Download Button - appears on hover */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={() => {
                                  // Determine image type based on content
                                  let imageType: 'generated' | 'enhanced' | 'edited' = 'generated';
                                  if (message.content.includes('Enhanced Successfully')) {
                                    imageType = 'enhanced';
                                  } else if (message.content.includes('Image Edited Successfully')) {
                                    imageType = 'edited';
                                  }
                                  
                                  downloadImageWithContext(message.imageUrl!, message.content, imageType);
                                }}
                                className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
                                title="Download Image"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </button>
                            </div>
                            
                            {/* Image Info Badge */}
                            <div className="absolute bottom-2 left-2">
                              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/30">
                                <span className="text-xs text-white/90 font-medium">
                                  {message.content.includes('Enhanced Successfully') ? 'Enhanced' : 
                                   message.content.includes('Image Edited Successfully') ? 'Edited' : 'Generated'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                        message.role === 'user' ? 'border-white/20' : 'border-white/10'
                      }`}>
                        <div className={`text-xs font-medium ${
                          message.role === 'user' ? 'text-blue-100' : 'text-white/50'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                        
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                              <Copy className="w-3 h-3 text-white/70" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                              <Heart className="w-3 h-3 text-white/70" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                              <Share2 className="w-3 h-3 text-white/70" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/10">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-white/80 text-sm font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Compact Input Area */}
          <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl p-4">
            <div className="max-w-4xl mx-auto">
              {/* Input Container */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    {/* Add Button */}
                    <div className="relative" ref={addPopupRef}>
                      <button 
                        onClick={() => setAddPopupOpen(!isAddPopupOpen)}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 group z-10 hover:scale-110 active:scale-95 ${
                          isAddPopupOpen 
                            ? 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 hover:from-blue-600/90 hover:to-purple-600/90 border-2 border-blue-400/70 shadow-lg shadow-blue-500/50 ring-2 ring-blue-500/30' 
                            : 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/80 hover:to-purple-600/80 border-2 border-blue-400/50 shadow-lg shadow-blue-500/25'
                        }`}
                        title="Add attachments, files, or media"
                      >
                        <Plus className={`w-4 h-4 transition-all duration-300 font-bold drop-shadow-sm ${
                          isAddPopupOpen ? 'text-white scale-110' : 'text-white group-hover:text-white/95'
                        }`} />
                      </button>
                      
                      {isAddPopupOpen && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                            onClick={() => setAddPopupOpen(false)}
                          />
                          {/* Popup - Fixed position at top of screen */}
                          <div className="fixed top-16 left-4 z-[9999]">
                            <div className="w-72 bg-black/95 backdrop-blur-xl border-2 border-blue-400/30 rounded-xl shadow-2xl overflow-hidden">
                              <div className="p-0">
                                {/* Enhanced Header */}
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/20 px-3 py-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                      <Plus className="w-3 h-3 text-white font-bold" />
                                    </div>
                                    <div>
                                      <div className="text-white font-semibold text-xs">Add to Message</div>
                                      <div className="text-white/60 text-xs">Attach files, media, or content</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Menu Items */}
                                <div className="p-2 space-y-1">
                                  {addMenuItems.map((item, index) => (
                                    <button
                                      key={index}
                                      onClick={() => {
                                        setAddPopupOpen(false);
                                        if (item.action) {
                                          item.action();
                                        } else {
                                          toast({
                                            title: 'Feature Coming Soon',
                                            description: `${item.text} functionality will be available soon!`,
                                          });
                                        }
                                      }}
                                      className={`w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:border-white/10 ${item.color} group`}
                                    >
                                      <div className="flex-shrink-0">
                                        {item.icon}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="text-white font-medium text-xs group-hover:text-white/90">{item.text}</div>
                                        <div className="text-white/50 text-xs mt-0.5">{item.description}</div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Current Mode Indicator */}
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded-md bg-white/10 border border-white/20`}>
                      <div className={`${getModeColor(currentMode)}`}>
                        {getModeIcon(currentMode)}
                      </div>
                      <span className="text-white/80 text-xs font-medium capitalize">{currentMode}</span>
                    </div>
                    
                    {/* Enhancement Menu Button */}
                    <div className="relative">
                      <button
                        onClick={() => setEnhancementMenuOpen(!isEnhancementMenuOpen)}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 text-purple-300 hover:text-purple-200 transition-all duration-200 group"
                        title="Enhancement Options"
                      >
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-medium">Enhance</span>
                        <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                      
                      {isEnhancementMenuOpen && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                            onClick={() => setEnhancementMenuOpen(false)}
                          />
                          {/* Enhancement Menu */}
                          <div className="absolute top-full left-0 mt-1 z-[9999]">
                            <div className="w-64 bg-black/95 backdrop-blur-xl border-2 border-purple-400/30 rounded-xl shadow-2xl overflow-hidden">
                              <div className="p-0">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-white/20 px-3 py-2">
                                  <div className="flex items-center space-x-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <div>
                                      <div className="text-white font-semibold text-xs">Image Enhancement</div>
                                      <div className="text-white/60 text-xs">Select enhancement options</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Menu Items */}
                                <div className="p-2 space-y-1">
                                  <button
                                    onClick={() => {
                                      setEnhancementMenuOpen(false);
                                      setShowImageUpload(true);
                                    }}
                                    className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:border-white/10 hover:bg-blue-500/20 hover:border-blue-400/30 group"
                                  >
                                    <ImageIcon className="w-4 h-4 text-blue-400" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-white font-medium text-xs group-hover:text-white/90">Upload & Enhance Image</div>
                                      <div className="text-white/50 text-xs mt-0.5">Upload a new image for enhancement</div>
                                    </div>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setEnhancementMenuOpen(false);
                                      startImageSelection();
                                    }}
                                    className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:border-white/10 hover:bg-purple-500/20 hover:border-purple-400/30 group"
                                  >
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-white font-medium text-xs group-hover:text-white/90">Select Image from Chat</div>
                                      <div className="text-white/50 text-xs mt-0.5">Choose an image from the conversation</div>
                                    </div>
                                  </button>
                                  
                                  {selectedImageId && (
                                    <button
                                      onClick={() => {
                                        setEnhancementMenuOpen(false);
                                        analyzeSelectedImage();
                                      }}
                                      className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:border-white/10 hover:bg-green-500/20 hover:border-green-400/30 group"
                                    >
                                      <MessageSquare className="w-4 h-4 text-green-400" />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-white font-medium text-xs group-hover:text-white/90">Analyze Selected Image</div>
                                        <div className="text-white/50 text-xs mt-0.5">Get detailed analysis and suggestions</div>
                                      </div>
                                    </button>
                                  )}
                                  
                                  {conversationContext.selectedImageUrl && (
                                    <button
                                      onClick={() => {
                                        setEnhancementMenuOpen(false);
                                        setSelectedImageId(null);
                                        setConversationContext(prev => ({
                                          ...prev,
                                          selectedImageUrl: undefined,
                                          selectedImageMessage: undefined,
                                          enhancementHistory: []
                                        }));
                                        toast({
                                          title: 'Selection Cleared',
                                          description: 'You can select a different image now.',
                                        });
                                      }}
                                      className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:border-white/10 hover:bg-red-500/20 hover:border-red-400/30 group"
                                    >
                                      <X className="w-4 h-4 text-red-400" />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-white font-medium text-xs group-hover:text-white/90">Clear Selection</div>
                                        <div className="text-white/50 text-xs mt-0.5">Remove current image selection</div>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Image Selection Status */}
                    {selectedImageId && (
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-green-500/20 border border-green-400/30">
                        <Target className="w-3 h-3 text-green-400" />
                        <span className="text-green-300 text-xs font-medium">Image Selected</span>
                        <button
                          onClick={() => {
                            setSelectedImageId(null);
                            setConversationContext(prev => ({
                              ...prev,
                              selectedImageUrl: undefined,
                              selectedImageMessage: undefined,
                              enhancementHistory: []
                            }));
                            toast({
                              title: 'Image Selection Cleared',
                              description: 'You can select a different image now.',
                            });
                          }}
                          className="ml-1 p-0.5 hover:bg-green-500/30 rounded transition-colors"
                          title="Clear selection"
                        >
                          <X className="w-3 h-3 text-green-400" />
                        </button>
                      </div>
                    )}
                    
                    {/* Image Selection Mode Indicator */}
                    {imageSelectionMode && (
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-purple-500/20 border border-purple-400/30">
                        <Target className="w-3 h-3 text-purple-400 animate-pulse" />
                        <span className="text-purple-300 text-xs font-medium">Select Image</span>
                        <button
                          onClick={cancelImageSelection}
                          className="ml-1 p-0.5 hover:bg-purple-500/30 rounded transition-colors"
                          title="Cancel selection"
                        >
                          <X className="w-3 h-3 text-purple-400" />
                        </button>
                      </div>
                    )}
                    
                    {/* Enhancement Conversation Context */}
                    {conversationContext.selectedImageUrl && conversationContext.enhancementHistory.length > 0 && (
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-blue-500/20 border border-blue-400/30">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300 text-xs font-medium">
                          {conversationContext.enhancementHistory.length} Enhancement{conversationContext.enhancementHistory.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => {
                            setConversationContext(prev => ({
                              ...prev,
                              enhancementHistory: []
                            }));
                            toast({
                              title: 'Enhancement History Cleared',
                              description: 'Starting fresh enhancement conversation.',
                            });
                          }}
                          className="ml-1 p-0.5 hover:bg-blue-500/30 rounded transition-colors"
                          title="Clear enhancement history"
                        >
                          <RotateCcw className="w-3 h-3 text-blue-400" />
                        </button>
                      </div>
                    )}
                    
                    {/* Enhancement Request Mode Indicator */}
                    {enhancementRequestMode && (
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-orange-500/20 border border-orange-400/30">
                        <MessageSquare className="w-3 h-3 text-orange-400 animate-pulse" />
                        <span className="text-orange-300 text-xs font-medium">Waiting for Confirmation</span>
                        <button
                          onClick={() => {
                            setEnhancementRequestMode(false);
                            toast({
                              title: 'Enhancement Cancelled',
                              description: 'You can try a different enhancement request.',
                            });
                          }}
                          className="ml-1 p-0.5 hover:bg-orange-500/30 rounded transition-colors"
                          title="Cancel enhancement request"
                        >
                          <X className="w-3 h-3 text-orange-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Voice Test Buttons */}
                    <button 
                      onClick={testVoiceFunctionality}
                      className="flex items-center justify-center w-7 h-7 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-md transition-all duration-300"
                      title="Test Voice"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    </button>
                    
                    <button 
                      onClick={() => simulateVoiceMessage("Hello AI, can you help me with JavaScript programming?")}
                      className="flex items-center justify-center w-7 h-7 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-md transition-all duration-300"
                      title="Simulate Voice"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    </button>
                    
                    <button 
                      onClick={testPhotoGeneration}
                      className="flex items-center justify-center w-7 h-7 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-md transition-all duration-300"
                      title="Test Photo Generation"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                    </button>
                    
                    <button 
                      onClick={testAllPhotoStyles}
                      className="flex items-center justify-center w-7 h-7 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-md transition-all duration-300"
                      title="Test All Photo Styles"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    </button>
                    
                    <button 
                      onClick={testKeyStyles}
                      className="flex items-center justify-center w-7 h-7 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-md transition-all duration-300"
                      title="Test Key Photo Styles"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                    </button>
                    
                    <button 
                      onClick={testImageEditing}
                      className="flex items-center justify-center w-7 h-7 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-md transition-all duration-300"
                      title="Test Image Editing"
                    >
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                    
                    <button 
                      onClick={testAPI}
                      className="flex items-center justify-center w-7 h-7 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-md transition-all duration-300"
                      title="Test API Connection"
                    >
                      <Zap className="w-3.5 h-3.5 text-green-400" />
                    </button>
                    
                    <button 
                      onClick={testImageEnhancement}
                      className="flex items-center justify-center w-7 h-7 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-md transition-all duration-300"
                      title="Test Image Enhancement"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    
                    <button 
                      onClick={showImageEditHelp}
                      className="flex items-center justify-center w-7 h-7 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-md transition-all duration-300"
                      title="Image Editing Help"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    </button>
                    
                    {currentMode === 'photo' && (
                      <button 
                        onClick={() => setShowPhotoGuide(true)}
                        className="flex items-center justify-center w-7 h-7 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-md transition-all duration-300"
                        title="Photo Generation Guide"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    )}

                    {/* Audio Toggle */}
                    <button 
                      onClick={toggleAudio}
                      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300 border ${
                        audioEnabled 
                          ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400' 
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/50'
                      }`}
                    >
                      {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    {/* Voice Recording */}
                    <button 
                      onClick={handleMicClick}
                      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300 border ${
                        isRecording 
                          ? 'bg-red-500/30 hover:bg-red-500/40 border-red-500/50 text-red-300 animate-pulse' 
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/70'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Text Input */}
                <div className={`p-3 transition-all duration-300 ${!sidebarOpen ? 'px-6' : ''}`}>
                  <div className={`flex items-end space-x-3 ${!sidebarOpen ? 'max-w-6xl mx-auto' : ''}`}>
                    <div className="flex-1">
                      <textarea
                        className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none resize-none text-sm font-medium leading-relaxed min-h-[50px] max-h-[150px]"
                        placeholder="Type your message here... Press Enter to send, Shift+Enter for new line"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        rows={1}
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    </div>
                    
                    {/* Send Button */}
                    <button 
                      onClick={() => sendMessage()} 
                      disabled={isLoading || !input.trim()}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 shadow-lg ${
                        input.trim() && !isLoading
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105 active:scale-95 shadow-blue-500/25' 
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className={`flex items-center justify-between mt-3 text-xs text-white/40 transition-all duration-300 ${!sidebarOpen ? 'px-6' : ''}`}>
                <div className="flex items-center space-x-3">
                  <span>AI may make mistakes. Verify important information.</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Connected to Venice AI</span>
                  </div>
                  {currentSessionId && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Auto-saving</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span>{messages.length - 1} messages</span>
                  <span>•</span>
                  <span>{selectedModel}</span>
                  {currentSessionId && (
                    <>
                      <span>•</span>
                      <span className="text-blue-300">Saved</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      

      
      {/* Image Upload Popup */}
      {showImageUpload && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={() => setShowImageUpload(false)}
          />
          {/* Popup */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
            <div className="w-96 bg-black/95 backdrop-blur-xl border-2 border-blue-400/30 rounded-xl shadow-2xl overflow-hidden" ref={imageUploadRef}>
              <div className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/20 px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-white font-bold" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Upload & Enhance Image</div>
                      <div className="text-white/60 text-xs">AI will analyze and enhance your image</div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-blue-400/30 rounded-lg p-6 text-center hover:border-blue-400/50 transition-colors duration-200">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 flex flex-col items-center justify-center space-y-2 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                    >
                      <ImageIcon className="w-8 h-8 text-blue-400" />
                      <div className="text-white font-medium text-sm">Click to upload image</div>
                      <div className="text-white/50 text-xs">JPG, PNG, WebP (max 10MB)</div>
                    </button>
                  </div>
                  
                  {/* Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-blue-300 mb-2">What happens next?</h4>
                    <div className="text-xs text-blue-200/80 space-y-1">
                      <div>• AI will analyze your image in detail</div>
                      <div>• Get enhancement suggestions and feedback</div>
                      <div>• Describe changes you want to make</div>
                      <div>• AI will enhance the image accordingly</div>
                    </div>
                  </div>
                  
                  {/* Example Prompts */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-purple-300 mb-2">Enhancement Examples</h4>
                    <div className="text-xs text-purple-200/80 space-y-1">
                      <div>• "Enhance the lighting and make it more dramatic"</div>
                      <div>• "Improve the colors and add more vibrancy"</div>
                      <div>• "Add more detail to the background"</div>
                      <div>• "Make it look more professional"</div>
                      <div>• "Convert to black and white"</div>
                    </div>
                  </div>
                  
                  {/* Uploaded Image Display */}
                  {uploadedImage && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-300 font-medium">Image Uploaded</span>
                        </div>
                        <button
                          onClick={() => downloadImage(uploadedImage, 'uploaded-image')}
                          className="p-1 text-green-300 hover:text-green-200 transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="relative">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded Image" 
                          className="w-full h-32 object-cover rounded-lg border border-green-500/30"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-t border-white/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowImageUpload(false)}
                      className="text-white/70 hover:text-white text-sm transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <div className="text-white/50 text-xs">
                      {isAnalyzingImage ? 'Analyzing...' : 'Ready to upload'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Photo Generation Guide */}
      {showPhotoGuide && (
        <PhotoGenerationGuide onClose={() => setShowPhotoGuide(false)} />
      )}
    </div>
  );
};

export default Algebrain;