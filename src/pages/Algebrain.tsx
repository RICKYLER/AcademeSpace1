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
import { Brain, Send, User, Bot, Calculator, BookOpen, Trophy, Lightbulb, RefreshCw, Plus, ChevronDown, Mic, ArrowUp, Image as ImageIcon, Box, FileText, Code, Zap, Sparkles, Palette, Camera, Settings, Maximize2, MicOff, Volume2, VolumeX, Home, Menu, X, Minimize2, RotateCcw, Download, Share2, Copy, Star, Heart, MessageSquare, Bookmark, MoreHorizontal, Clock, History, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Target, ArrowRight, ArrowLeft, ChevronRight, Trash2, Edit3 } from 'lucide-react';
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

// Helper function to format AI responses with selective bold formatting and proper spacing
const formatAIResponse = (content: string) => {
  // Define important words/phrases that should be bolded
  const importantWords = [
    // Technical terms
    'API', 'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS',
    'database', 'algorithm', 'function', 'variable', 'array', 'object', 'class',
    
    // Math terms
    'equation', 'derivative', 'integral', 'matrix', 'vector', 'theorem', 'proof',
    'algebra', 'calculus', 'geometry', 'statistics', 'probability',
    
    // General important terms
    'important', 'note', 'warning', 'error', 'success', 'solution', 'result',
    'key', 'main', 'primary', 'essential', 'critical', 'significant',
    
    // Action words
    'install', 'configure', 'setup', 'create', 'build', 'deploy', 'test',
    'debug', 'fix', 'update', 'upgrade', 'download', 'upload',
    
    // Status indicators
    'completed', 'failed', 'pending', 'active', 'inactive', 'enabled', 'disabled',
    
    // Additional important terms
    'blockchain', 'cryptocurrency', 'AI', 'machine learning', 'neural network',
    'authentication', 'authorization', 'encryption', 'security',
    'performance', 'optimization', 'scalability', 'responsive',
    
    // Systems analysis terms
    'Systems Analysis', 'Systems Design', 'Project', 'System Development Life Cycle',
    'SDLC', 'requirements', 'stakeholders', 'business value', 'scalability',
    'architecture', 'interfaces', 'components', 'blueprint'
  ];
  
  // Convert existing **bold** markdown to regular text first
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '$1');
  
  // Add proper spacing between lettered/numbered sections
  // Match patterns like "a.", "b.", "c." at the start of lines
  formatted = formatted.replace(/^([a-z]\.)\s*(.+?):/gmi, '<div style="margin-top: 1.5em; margin-bottom: 0.5em;"><strong>$1 $2:</strong></div>');
  
  // Match patterns like "1.", "2.", "3." at the start of lines
  formatted = formatted.replace(/^(\d+\.)\s*(.+?):/gmi, '<div style="margin-top: 1.5em; margin-bottom: 0.5em;"><strong>$1 $2:</strong></div>');
  
  // Add spacing between major sections (Part A, Part B, etc.)
  formatted = formatted.replace(/^(Part [A-Z][^:]*:)/gmi, '<div style="margin-top: 2em; margin-bottom: 1em; font-size: 1.1em;"><strong>$1</strong></div>');
  
  // Add spacing for question sections
  formatted = formatted.replace(/^(Question \d+[^:]*:)/gmi, '<div style="margin-top: 2em; margin-bottom: 1em; font-size: 1.1em;"><strong>$1</strong></div>');
  
  // Bold only important words (case-insensitive)
  importantWords.forEach(word => {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    formatted = formatted.replace(regex, '<strong>$1</strong>');
  });
  
  // Convert *italic* to HTML italic tags (keep this)
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert bullet points to proper HTML lists
  formatted = formatted.replace(/^[•·*-]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive list items in ul tags
  formatted = formatted.replace(/((<li>.*<\/li>\s*)+)/g, '<ul style="margin: 0.5em 0; padding-left: 1.5em;">$1</ul>');
  
  // Convert numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  
  // Convert ### headings to h3 (these should remain bold)
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 style="font-weight: bold; font-size: 1.1em; margin: 1.5em 0 0.5em 0;">$1</h3>');
  
  // Convert ## headings to h2 (these should remain bold)
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 style="font-weight: bold; font-size: 1.2em; margin: 2em 0 0.5em 0;">$1</h2>');
  
  // Convert # headings to h1 (these should remain bold)
  formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1 style="font-weight: bold; font-size: 1.3em; margin: 2em 0 0.5em 0;">$1</h1>');
  
  // Bold specific patterns that are always important
  // Error messages
  formatted = formatted.replace(/(Error:|Warning:|Note:|Important:)/gi, '<strong>$1</strong>');
  
  // File extensions
  formatted = formatted.replace(/\.(js|ts|jsx|tsx|py|html|css|json|md)\b/g, '<strong>$&</strong>');
  
  // Version numbers
  formatted = formatted.replace(/v?\d+\.\d+(\.\d+)?/g, '<strong>$&</strong>');
  
  // URLs and file paths (make them stand out)
  formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<strong>$1</strong>');
  formatted = formatted.replace(/(\/[^\s]+\.[a-zA-Z]+)/g, '<strong>$1</strong>');
  
  // Add paragraph spacing for better readability
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};

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
  const recognitionRef = useRef<any | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const veniceTTSAbortRef = useRef<AbortController | null>(null);

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
  
  // Image paste and OCR state
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Image selection and conversation state
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [imageSelectionMode, setImageSelectionMode] = useState(false);
  const [enhancementRequestMode, setEnhancementRequestMode] = useState(false);
  const [pendingEnhancementPrompt, setPendingEnhancementPrompt] = useState<string>('');
  const [conversationContext, setConversationContext] = useState<{
    selectedImageUrl?: string;
    selectedImageMessage?: Message;
    enhancementHistory: Array<{prompt: string, resultUrl: string}>;
    topicThread: string[];
    userExpertiseLevel: 'beginner' | 'intermediate' | 'advanced';
    conversationDepth: number;
    relatedTopics: string[];
    followUpSuggestions: string[];
    userPreferences: {
      responseStyle: 'concise' | 'detailed' | 'comprehensive';
      technicalLevel: 'basic' | 'intermediate' | 'expert';
      preferredExamples: 'practical' | 'theoretical' | 'mixed';
    };
  }>({
    enhancementHistory: [],
    topicThread: [],
    userExpertiseLevel: 'intermediate',
    conversationDepth: 0,
    relatedTopics: [],
    followUpSuggestions: [],
    userPreferences: {
      responseStyle: 'detailed',
      technicalLevel: 'intermediate',
      preferredExamples: 'practical'
    }
  });

  // State for the selected model
  const [selectedModel, setSelectedModel] = useState('Brainwave 2.5');
  const models = ['Brainwave 2.5', 'Creative Fusion', 'Visionary AI 3.0', 'CodeMaster Pro', 'MathGenius Ultra'];

  // Chat history state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connected');

  const [showAllSections, setShowAllSections] = useState(true);

  // Proactive conversation features
  const [proactiveFeatures, setProactiveFeatures] = useState({
    suggestRelatedTopics: true,
    anticipateQuestions: true,
    provideDeepDives: true,
    trackLearningProgress: true
  });

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

  // Function to generate proactive suggestions
  const generateProactiveSuggestions = (lastResponse: string, mode: AIMode): string[] => {
    const suggestions = [];
    
    // Analyze response content for suggestion opportunities
    if (lastResponse.includes('example') || lastResponse.includes('instance')) {
      suggestions.push('Would you like to see more examples?');
    }
    
    if (lastResponse.includes('concept') || lastResponse.includes('theory')) {
      suggestions.push('Should I explain the underlying principles?');
    }
    
    if (mode === 'programming' && lastResponse.includes('function')) {
      suggestions.push('Would you like to see this implemented in other languages?');
    }
    
    if (mode === 'math' && (lastResponse.includes('equation') || lastResponse.includes('formula'))) {
      suggestions.push('Would you like to see step-by-step derivation?');
    }
    
    if (lastResponse.includes('error') || lastResponse.includes('mistake')) {
      suggestions.push('Should I show you how to avoid this in the future?');
    }
    
    return suggestions;
  };

  // Function to analyze conversation patterns
  const analyzeConversationPatterns = (messages: Message[]): string => {
    const recentMessages = messages.slice(-10);
    const topics = extractTopics(recentMessages);
    const questionTypes = analyzeQuestionTypes(recentMessages);
    const userEngagement = measureEngagement(recentMessages);
    
    return `Recent Topics: ${topics.join(', ')}
Question Patterns: ${questionTypes}
Engagement Level: ${userEngagement}`;
  };

  // Function to extract topics from messages
  const extractTopics = (messages: Message[]): string[] => {
    const topics = new Set<string>();
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Programming topics
      if (content.includes('javascript') || content.includes('js')) topics.add('JavaScript');
      if (content.includes('python')) topics.add('Python');
      if (content.includes('react')) topics.add('React');
      if (content.includes('api')) topics.add('API Development');
      if (content.includes('database')) topics.add('Database');
      
      // Math topics
      if (content.includes('algebra')) topics.add('Algebra');
      if (content.includes('calculus')) topics.add('Calculus');
      if (content.includes('statistics')) topics.add('Statistics');
      if (content.includes('geometry')) topics.add('Geometry');
      
      // Photo topics
      if (content.includes('image') || content.includes('photo')) topics.add('Image Processing');
      if (content.includes('enhance')) topics.add('Image Enhancement');
      if (content.includes('generate')) topics.add('Image Generation');
    });
    
    return Array.from(topics).slice(0, 5);
  };

  // Function to analyze question types
  const analyzeQuestionTypes = (messages: Message[]): string => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const questionWords = ['how', 'what', 'why', 'when', 'where', 'which'];
    const requestWords = ['can you', 'could you', 'please', 'help'];
    
    let questions = 0;
    let requests = 0;
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (questionWords.some(word => content.includes(word))) questions++;
      if (requestWords.some(word => content.includes(word))) requests++;
    });
    
    if (questions > requests) return 'Inquiry-focused';
    if (requests > questions) return 'Task-oriented';
    return 'Mixed conversation';
  };

  // Function to measure user engagement
  const measureEngagement = (messages: Message[]): string => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
    
    if (avgLength > 100) return 'High engagement';
    if (avgLength > 50) return 'Medium engagement';
    return 'Low engagement';
  };

  // Function to count technical terms
  const countTechnicalTerms = (messages: Message[]): number => {
    const technicalTerms = [
      'function', 'variable', 'array', 'object', 'class', 'method', 'algorithm',
      'database', 'query', 'api', 'framework', 'library', 'component',
      'derivative', 'integral', 'matrix', 'vector', 'equation', 'theorem',
      'pixel', 'resolution', 'enhancement', 'filter', 'compression'
    ];
    
    let count = 0;
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      technicalTerms.forEach(term => {
        if (content.includes(term)) count++;
      });
    });
    
    return count;
  };

  // Function to analyze question complexity
  const analyzeQuestionComplexity = (messages: Message[]): number => {
    let complexityScore = 0;
    const complexIndicators = [
      'implement', 'optimize', 'architecture', 'design pattern', 'algorithm',
      'performance', 'scalability', 'integration', 'advanced', 'complex'
    ];
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      complexIndicators.forEach(indicator => {
        if (content.includes(indicator)) complexityScore += 0.1;
      });
      
      // Longer messages tend to be more complex
      if (msg.content.length > 200) complexityScore += 0.1;
      if (msg.content.length > 500) complexityScore += 0.2;
    });
    
    return Math.min(complexityScore, 1.0); // Cap at 1.0
  };

  // Function to determine user expertise level
  const determineExpertiseLevel = (messages: Message[]): 'beginner' | 'intermediate' | 'advanced' => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const technicalTerms = countTechnicalTerms(userMessages);
    const questionComplexity = analyzeQuestionComplexity(userMessages);
    
    if (technicalTerms > 10 && questionComplexity > 0.7) return 'advanced';
    if (technicalTerms > 5 && questionComplexity > 0.4) return 'intermediate';
    return 'beginner';
  };

  // Function to extract related topics from response
  const extractRelatedTopics = (response: string): string[] => {
    const topics = [];
    
    // Programming related topics
    if (response.includes('JavaScript')) topics.push('TypeScript', 'React', 'Node.js');
    if (response.includes('Python')) topics.push('Django', 'Flask', 'Data Science');
    if (response.includes('API')) topics.push('REST', 'GraphQL', 'Authentication');
    
    // Math related topics
    if (response.includes('algebra')) topics.push('calculus', 'geometry', 'statistics');
    if (response.includes('derivative')) topics.push('integration', 'limits', 'optimization');
    
    // Photo related topics
    if (response.includes('photography')) topics.push('composition', 'lighting', 'editing');
    
    return topics.slice(0, 3); // Limit to 3 topics
  };

  // Add proper type guards
  const isValidMessage = (message: any): message is Message => {
    return message && 
           typeof message.id === 'string' && 
           typeof message.role === 'string' && 
           typeof message.content === 'string' && 
           message.timestamp instanceof Date;
  };

  // Enhanced response processing
  const processAIResponse = (response: string, userInput: string): Message => {
    if (!response || typeof response !== 'string') {
      throw new Error('Invalid AI response received');
    }
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: formatAIResponse(response),
      timestamp: new Date(),
      type: 'text'
    };
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
    // Initialize enhanced error handling
    enhancedErrorHandling.monitorConnection();
    // Initialize performance monitoring
    console.log('Performance monitoring initialized');
  }, []);

  // Add error boundary for component
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error caught:', error);
      toast({
        title: 'Application Error',
        description: 'An unexpected error occurred. Please refresh the page.',
        variant: 'destructive',
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      try { 
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      
      try { 
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch {}
      
      try { 
        speechSynthesis.cancel(); 
      } catch {}
      
      try { 
        if (veniceTTSAbortRef.current) {
          veniceTTSAbortRef.current.abort();
        }
      } catch {}
    };
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
      enhancementHistory: [],
      topicThread: [],
      userExpertiseLevel: 'intermediate',
      conversationDepth: 0,
      relatedTopics: [],
      followUpSuggestions: [],
      userPreferences: {
        responseStyle: 'detailed',
        technicalLevel: 'intermediate',
        preferredExamples: 'practical'
      }
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

  // Message action functions
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      });
    }
  };

  const likeMessage = (messageId: string) => {
    // Add like functionality - could store in localStorage or send to backend
    const likedMessages = JSON.parse(localStorage.getItem('likedMessages') || '[]');
    if (!likedMessages.includes(messageId)) {
      likedMessages.push(messageId);
      localStorage.setItem('likedMessages', JSON.stringify(likedMessages));
      toast({
        title: "Message liked",
        description: "You liked this message.",
      });
    } else {
      toast({
        title: "Already liked",
        description: "You have already liked this message.",
      });
    }
  };

  const shareMessage = async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Assistant Message',
          text: content,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(content);
        toast({
          title: "Shared via clipboard",
          description: "Message copied to clipboard for sharing.",
        });
      }
    } catch (error) {
      console.error('Failed to share message:', error);
      toast({
        title: "Share failed",
        description: "Failed to share message.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
      toast({
        title: "Message deleted",
        description: "The message has been removed from the conversation.",
      });
      return updatedMessages;
    });
  };

  const startEditing = (messageId: string) => {
    // Find the message and enable editing mode
    const messageToEdit = messages.find(msg => msg.id === messageId);
    if (messageToEdit) {
      // Set the input to the message content for editing
      setInput(messageToEdit.content);
      // Remove the original message
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      toast({
        title: "Editing message",
        description: "Message content loaded in input for editing.",
      });
    }
  };

  // Voice recording and live transcription functions
  const startTranscription = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: 'Live Transcription Unavailable',
          description: 'Your browser does not support speech recognition. Please use a Chromium-based browser.',
        });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = (navigator.language || 'en-US');
      recognition.interimResults = true;
      recognition.continuous = true;

      lastTranscriptRef.current = '';
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        lastTranscriptRef.current = text;
      };

      recognition.onspeechend = () => {
        console.log('Speech ended, stopping transcription');
        stopTranscription();
        // Auto-stop a moment after the user stops speaking
        setTimeout(() => {
          if (mediaRecorderRef.current && isRecording) {
            try { stopRecording(); } catch {}
          }
        }, 300);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event?.error);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsTranscribing(true);
    } catch (e) {
      console.error('Failed to start transcription:', e);
      setIsTranscribing(false);
    }
  };

  const stopTranscription = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to stop transcription:', e);
    } finally {
      setIsTranscribing(false);
    }
  };

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

      // Start live transcription as we start recording
      startTranscription();

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
        // Stop live transcription when recording stops
        stopTranscription();
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

      // Start with a timeslice so ondataavailable fires periodically
      mediaRecorderRef.current.start(1000);
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
      } finally {
        // Ensure we stop transcription in any case
        stopTranscription();
      }
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const raw = (lastTranscriptRef.current || '').trim();
      let transcript = raw.replace(/\s+/g, ' ').trim();
      if (transcript && !/[.!?]"?$/.test(transcript)) {
        transcript = transcript + '.';
      }
      const contentToSend = transcript || 'Voice message (no live transcription available).';
      const voiceMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: contentToSend,
        timestamp: new Date(),
        type: 'voice',
        audioUrl: audioUrl
      };
      setMessages(prev => [...prev, voiceMessage]);
      if (transcript) {
        setInput(transcript);
        sendMessage(transcript);
        speakText(`You said: ${transcript}`);
        toast({
          title: 'Voice Transcribed',
          description: 'We sent your spoken message to the AI.',
        });
      } else {
        setInput('');
        toast({
          title: 'Could not transcribe',
          description: 'I could not capture your speech. Please try again or type your message.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: 'Voice Processing Error',
        description: 'Could not process voice input. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const speakText = async (text: string) => {
    if (!audioEnabled || !text.trim()) return;
    // Do not speak while recording to avoid feedback loops
    if (isRecording) return;

    // Cancel any in-flight Venice TTS request
    if (veniceTTSAbortRef.current) {
      try { veniceTTSAbortRef.current.abort(); } catch {}
      veniceTTSAbortRef.current = null;
    }

    const apiKey = import.meta.env.VITE_VENICE_AI_API_KEY as string | undefined;
    
    if (!apiKey) {
      console.warn('Venice AI API key not configured for TTS');
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
      }
      return;
    }

    try {
      // Stop any existing browser speech/audio
      try { speechSynthesis.cancel(); } catch {}
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      // New abort controller for this request
      const controller = new AbortController();
      veniceTTSAbortRef.current = controller;

      const response = await fetch('https://api.venice.ai/api/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          input: text.substring(0, 4096),
          model: 'tts-kokoro',
          voice: 'af_sky',
          response_format: 'mp3',
          speed: 1.0,
          streaming: false,
        }),
      });

      if (response.ok) {
        // Clear the controller on success of fetch
        if (veniceTTSAbortRef.current === controller) veniceTTSAbortRef.current = null;

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioRef.current = audio;

        setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) audioRef.current = null;
          tryBrowserTTS(text);
        };

        await audio.play();
        return;
      }
    } catch (err: any) {
      // If it was aborted, just return silently
      if (err?.name === 'AbortError') return;
      // fall through to browser TTS
    } finally {
      // Ensure we clear the abort controller if this instance is done
      if (veniceTTSAbortRef.current?.signal.aborted) {
        veniceTTSAbortRef.current = null;
      }
    }

    // Browser TTS fallback
    tryBrowserTTS(text);

    function tryBrowserTTS(s: string) {
      try {
        if ('speechSynthesis' in window) {
          // Do not speak while recording
          if (isRecording) return;
          speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(s);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;

          const voices = speechSynthesis.getVoices();
          const preferredVoice = voices.find(v =>
            v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')
          );
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);

          speechSynthesis.speak(utterance);
        }
      } catch {
        setIsPlaying(false);
      }
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
      
      const response = await fetch('/api/generate-image', {
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

  // Helper functions for context analysis
  const analyzeUserIntent = (input: string, history: Message[]): string => {
    const intents = {
      'question': /\?|how|what|why|when|where|explain/i,
      'request': /please|can you|could you|help me/i,
      'clarification': /mean|clarify|elaborate|more detail/i,
      'follow_up': /also|additionally|furthermore|next/i,
      'correction': /actually|no|wrong|mistake|correct/i
    };
    
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(input)) return intent;
    }
    return 'general';
  };

  const extractMainTopic = (content: string): string => {
    // Extract main topic from message content
    const words = content.toLowerCase().split(' ');
    const topicKeywords = ['programming', 'code', 'function', 'variable', 'math', 'equation', 'formula', 'image', 'photo', 'generate', 'enhance'];
    
    for (const keyword of topicKeywords) {
      if (words.includes(keyword)) return keyword;
    }
    
    // Return first few words as topic
    return words.slice(0, 3).join(' ');
  };

  const generateConversationSummary = (recentMessages: Message[]): string => {
    const topics = recentMessages
      .filter(msg => msg.role === 'user')
      .map(msg => extractMainTopic(msg.content))
      .filter(Boolean);
    
    return `Recent discussion: ${topics.slice(-3).join(' → ')}`;
  };

  const findRelatedContext = (input: string, history: Message[]): string => {
    // Find related messages in conversation history
    const relatedMessages = history
      .filter(msg => {
        const commonWords = input.toLowerCase().split(' ')
          .filter(word => word.length > 3)
          .filter(word => msg.content.toLowerCase().includes(word));
        return commonWords.length > 0;
      })
      .slice(-3);
    
    return relatedMessages.length > 0 
      ? `Related previous discussion: ${relatedMessages.map(m => m.content.slice(0, 50)).join(' | ')}` 
      : 'No directly related context found';
  };

  const generateFollowUpSuggestions = (input: string, mode: AIMode): string => {
    const suggestions = {
      'programming': [
        'Would you like to see implementation examples?',
        'Should I explain the underlying concepts?',
        'Do you need help with testing or debugging?'
      ],
      'math': [
        'Would you like to see step-by-step solutions?',
        'Should I explain the mathematical principles?',
        'Do you want to explore related problems?'
      ],
      'photo': [
        'Would you like variations of this image?',
        'Should I suggest enhancement techniques?',
        'Do you want to explore different styles?'
      ],
      'general': [
        'Would you like more detailed information?',
        'Should I provide practical examples?',
        'Do you have related questions?'
      ]
    };
    
    return suggestions[mode]?.join(' | ') || '';
  };

  const getEnhancedSystemPrompt = (mode: AIMode, conversationHistory: Message[], userPreferences?: any): string => {
    const basePrompt = `You are an advanced AI assistant with deep expertise across multiple domains. You excel at:

🧠 **Contextual Understanding**: Analyze conversation patterns, user intent, and implicit needs
💭 **Deep Reasoning**: Provide multi-layered responses that address both explicit and implicit questions
🔄 **Adaptive Learning**: Adjust communication style based on user expertise level and preferences
🎯 **Proactive Assistance**: Anticipate follow-up questions and provide comprehensive guidance

Current Mode: ${mode}
Conversation Depth: ${conversationHistory.length > 5 ? 'Deep' : 'Surface'}
User Expertise Level: ${determineExpertiseLevel(conversationHistory)}

**Conversation Context Analysis:**
${analyzeConversationPatterns(conversationHistory)}

**Response Guidelines:**
- Provide layered responses (immediate answer + deeper insights + related concepts)
- Reference previous conversation points when relevant
- Suggest logical next steps or related topics
- Adapt complexity to user's demonstrated knowledge level
- Ask clarifying questions to deepen understanding`;
    
    const contextualPrompt = conversationHistory.length > 5 
      ? `\n\nConversation Context: This is an ongoing conversation. The user has been discussing ${mode} topics. Please maintain continuity and reference previous discussions when relevant.`
      : '';
    
    return basePrompt + contextualPrompt;
  };

  // Enhanced AI configuration for better performance
  const optimizedAIConfig = {
    // Reduce response time with optimized parameters
    maxTokens: 1500, // Balanced for quality vs speed
    temperature: 0.7, // Optimal creativity vs consistency
    
    // Implement response caching
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    
    // Request optimization
    streamResponse: true, // Enable streaming for faster perceived response
    batchRequests: true, // Batch multiple requests when possible
    
    // Error recovery
    maxRetries: 3,
    retryDelay: 1000, // 1 second between retries
    fallbackModel: 'gpt-3.5-turbo' // Backup model if primary fails
  };

  // Intelligent context optimization
  const smartContextManager = {
    // Dynamic context sizing based on conversation complexity
    getOptimalContextSize(conversation: Message[]) {
      const complexity = this.analyzeComplexity(conversation);
      return complexity > 0.7 ? 15 : 10; // More context for complex conversations
    },
    
    // Relevance-based message filtering
    filterRelevantMessages(messages: Message[], currentInput: string) {
      return messages.filter(msg => {
        const relevanceScore = this.calculateRelevance(msg.content, currentInput);
        return relevanceScore > 0.3;
      }).slice(-this.getOptimalContextSize(messages));
    },
    
    // Conversation summarization for long chats
    summarizeLongConversation(messages: Message[]) {
      if (messages.length > 50) {
        // Summarize older messages to maintain context while reducing tokens
        const recentMessages = messages.slice(-20);
        const olderMessages = messages.slice(0, -20);
        const summary = this.generateSummary(olderMessages);
        
        return [summary, ...recentMessages];
      }
      return messages;
    },
    
    // Analyze conversation complexity
    analyzeComplexity(messages: Message[]): number {
      let complexityScore = 0;
      const technicalTerms = ['function', 'algorithm', 'implementation', 'architecture', 'optimization'];
      const mathTerms = ['equation', 'derivative', 'integral', 'theorem', 'proof'];
      
      messages.forEach(msg => {
        const content = msg.content.toLowerCase();
        
        // Technical complexity indicators
        technicalTerms.forEach(term => {
          if (content.includes(term)) complexityScore += 0.1;
        });
        
        mathTerms.forEach(term => {
          if (content.includes(term)) complexityScore += 0.1;
        });
        
        // Length-based complexity
        if (msg.content.length > 500) complexityScore += 0.1;
        if (msg.content.length > 1000) complexityScore += 0.2;
        
        // Code blocks indicate complexity
        if (content.includes('```') || content.includes('function') || content.includes('class')) {
          complexityScore += 0.2;
        }
      });
      
      return Math.min(complexityScore, 1.0);
    },
    
    // Calculate relevance between message and current input
    calculateRelevance(messageContent: string, currentInput: string): number {
      const messageWords = messageContent.toLowerCase().split(/\s+/);
      const inputWords = currentInput.toLowerCase().split(/\s+/);
      
      let commonWords = 0;
      let totalWords = inputWords.length;
      
      inputWords.forEach(word => {
        if (word.length > 3 && messageWords.includes(word)) {
          commonWords++;
        }
      });
      
      return totalWords > 0 ? commonWords / totalWords : 0;
    },
    
    // Generate summary of older messages
    generateSummary(messages: Message[]): Message {
      const topics = new Set<string>();
      const keyPoints: string[] = [];
      
      messages.forEach(msg => {
        if (msg.role === 'user') {
          // Extract main topics from user messages
          const content = msg.content.toLowerCase();
          if (content.includes('programming') || content.includes('code')) topics.add('Programming');
          if (content.includes('math') || content.includes('equation')) topics.add('Mathematics');
          if (content.includes('image') || content.includes('photo')) topics.add('Image Generation');
          
          // Extract key points (first 50 chars of longer messages)
          if (msg.content.length > 100) {
            keyPoints.push(msg.content.substring(0, 50) + '...');
          }
        }
      });
      
      const summaryContent = `📋 **Conversation Summary**\n\n**Topics Discussed:** ${Array.from(topics).join(', ')}\n**Key Points:** ${keyPoints.slice(0, 3).join(' | ')}\n**Messages:** ${messages.length} previous messages summarized`;
      
      return {
        id: 'summary-' + Date.now(),
        role: 'assistant',
        content: summaryContent,
        timestamp: new Date(),
        type: 'text'
      };
    }
  };

  // Debounce function for request optimization
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Optimized UI updates
  const optimizeUIPerformance = {
    // Virtualized message list for large conversations
    useVirtualization: true,
    
    // Debounced input handling
    debouncedInput: debounce((input: string) => {
      // Process input after user stops typing
    }, 300),
    
    // Lazy loading for images
    lazyLoadImages: true
  };

  // Real-time performance tracking
  const performanceMonitor = {
    metrics: {
      responseTime: [],
      errorRate: 0,
      successRate: 0,
      apiLatency: []
    },
    
    trackResponse(startTime: number, success: boolean) {
      const responseTime = Date.now() - startTime;
      this.metrics.responseTime.push(responseTime);
      
      if (success) {
        this.metrics.successRate++;
      } else {
        this.metrics.errorRate++;
      }
      
      // Auto-optimize based on performance
      if (this.getAverageResponseTime() > 5000) {
        this.enablePerformanceMode();
      }
    },
    
    getAverageResponseTime() {
      if (this.metrics.responseTime.length === 0) return 0;
      const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
      return sum / this.metrics.responseTime.length;
    },
    
    enablePerformanceMode() {
      // Reduce context size
      // Lower temperature for faster responses
      // Enable more aggressive caching
      console.log('Performance mode enabled due to slow responses');
    }
  };

  // Enhanced error handling and recovery
  const enhancedErrorHandling = {
    // Network resilience
    async sendWithRetry(request: any, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(request.url, request.options);
          
          if (response.ok) {
            return response;
          }
          
          // Handle specific error codes
          if (response.status === 429) {
            // Rate limiting - exponential backoff
            await this.delay(Math.pow(2, attempt) * 1000);
            continue;
          }
          
          if (response.status >= 500) {
            // Server errors - retry with delay
            await this.delay(attempt * 1000);
            continue;
          }
          
          // Client errors - don't retry
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }
          await this.delay(attempt * 1000);
        }
      }
    },
    
    // Delay utility
    delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Connection monitoring
    monitorConnection() {
      window.addEventListener('online', () => {
        this.handleConnectionRestore();
      });
      
      window.addEventListener('offline', () => {
        this.handleConnectionLoss();
      });
    },
    
    // Graceful degradation
    handleConnectionLoss() {
      // Switch to offline mode
      // Show cached responses
      // Queue requests for when connection returns
    },
    
    handleConnectionRestore() {
      // Restore online functionality
      // Process queued requests
    }
  };

  // Optimized message processing
  const processMessageOptimized = async (input: string, contextMessages: Message[], imageData?: string) => {
    try {
      // Pre-validate input
      if (!input.trim()) return;
      
      // Use optimized context window
      const optimizedContext = contextMessages.slice(-10); // Last 10 messages for context
      
      // Parallel processing for multiple operations
      const [response, analysis] = await Promise.all([
        sendToAI(input, optimizedContext, imageData),
        analyzeUserIntent(input, optimizedContext)
      ]);
      
      return response;
    } catch (error) {
      // Graceful error handling
      return handleAIError(error);
    }
  };

  // AI error handler
  const handleAIError = (error: any) => {
    console.error('AI processing error:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again.';
  };

  // Real-time response streaming
  const streamAIResponse = async (input: string, contextMessages: Message[], imageData?: string) => {
    const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
    
    if (!chatApiKey) {
      throw new Error('Venice AI Chat API key not configured.');
    }

    // Build optimized message context
    const enhancedMessages = [
      {
        role: 'system',
        content: getEnhancedSystemPrompt(currentMode, contextMessages, conversationContext)
      },
      ...contextMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: (msg as any).imageUrl
          ? [
              { type: 'text', text: msg.content },
              { type: 'image_url', image_url: { url: (msg as any).imageUrl } }
            ]
          : msg.content
      })),
      {
        role: 'user',
        content: imageData
          ? [
              { type: 'text', text: input },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          : input
      }
    ];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'default',
        messages: enhancedMessages,
        max_tokens: optimizedAIConfig.maxTokens,
        temperature: optimizedAIConfig.temperature,
        stream: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = '';
    
    if (!reader) {
      throw new Error('Response body reader not available');
    }
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedResponse += content;
              // Update UI in real-time
              updateMessageStream(accumulatedResponse);
            }
          } catch (e) {
            // Skip invalid JSON chunks
          }
        }
      }
    }
    
    return accumulatedResponse || 'Sorry, I couldn\'t process that request.';
  };

  // Update message stream in real-time
  const updateMessageStream = (content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id.endsWith('-streaming')) {
        // Update existing streaming message
        lastMessage.content = content;
      } else {
        // Create new streaming message
        newMessages.push({
          id: `${Date.now()}-streaming`,
          role: 'assistant',
          content: content,
          timestamp: new Date(),
          type: 'text'
        });
      }
      
      return newMessages;
    });
  };

  // Optimized AI request function (fallback for non-streaming)
  const sendToAI = async (input: string, contextMessages: Message[], imageData?: string) => {
    const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
    
    if (!chatApiKey) {
      throw new Error('Venice AI Chat API key not configured.');
    }

    // Build optimized message context
    const enhancedMessages = [
      {
        role: 'system',
        content: getEnhancedSystemPrompt(currentMode, contextMessages, conversationContext)
      },
      ...contextMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: (msg as any).imageUrl
          ? [
              { type: 'text', text: msg.content },
              { type: 'image_url', image_url: { url: (msg as any).imageUrl } }
            ]
          : msg.content
      })),
      {
        role: 'user',
        content: imageData ? [
          {
            type: 'text',
            text: input
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ] : input
      }
    ];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chatApiKey}`,
      },
      body: JSON.stringify({
        model: 'default',
        messages: enhancedMessages,
        max_tokens: optimizedAIConfig.maxTokens,
        temperature: optimizedAIConfig.temperature
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.';
  };

  const sendMessage = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    console.log('sendMessage called with:', messageText, 'customInput:', customInput);
    
    // Start performance tracking
    const startTime = Date.now();

    if (!customInput) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date(),
        type: pastedImage ? 'image' : 'text',
        ...(pastedImage && { imageUrl: pastedImage })
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setPastedImage(null); // Clear the pasted image after sending
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
          enhancementHistory: [],
          topicThread: [],
          conversationDepth: 0
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

      // Regular chat mode with optimized processing
      console.log('Sending request to Venice AI API with input:', currentInput);
      
      try {
        // Analyze user intent and conversation context with optimization
        const userIntent = analyzeUserIntent(currentInput, messages);
        const conversationSummary = generateConversationSummary(messages.slice(-10));
        const relatedContext = findRelatedContext(currentInput, messages);
        const followUpSuggestions = generateFollowUpSuggestions(currentInput, currentMode);
        
        // Enhanced conversation analysis
        const conversationPatterns = analyzeConversationPatterns(messages);
        const userExpertise = determineExpertiseLevel(messages);
        const topicThread = extractTopics(messages.slice(-5));
        
        // Update conversation context
        setConversationContext(prev => ({
          ...prev,
          topicThread,
          userExpertiseLevel: userExpertise,
          conversationDepth: prev.conversationDepth + 1,
          relatedTopics: extractRelatedTopics(currentInput)
        }));
        
        // Use streaming for real-time responses
        let finalResponse: string | null = null;
        try {
          const aiResponse = await streamAIResponse(currentInput, messages, pastedImage);
          
          // Finalize the streaming message
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            
            if (lastMessage && lastMessage.id.endsWith('-streaming')) {
              lastMessage.id = (Date.now() + 1).toString();
              lastMessage.content = aiResponse;
            }
            
            return newMessages;
          });

          // Save for post-processing (tracking + TTS)
          finalResponse = aiResponse;
        } catch (streamError) {
          console.error('Streaming failed, falling back to standard request:', streamError);
          // Fallback to non-streaming
          const aiResponse = await processMessageOptimized(currentInput, messages, pastedImage);
          
          const assistantMessage = processAIResponse(aiResponse, currentInput);
          setMessages(prev => [...prev, assistantMessage]);

          // Save for post-processing (tracking + TTS)
          finalResponse = aiResponse;
        }
        
        // Track successful response exactly once
        performanceMonitor.trackResponse(startTime, true);

        // Speak once if audio is enabled
        // Clear the pasted image after successful processing
        if (pastedImage) {
          setPastedImage(null);
        }

        if (audioEnabled && !isRecording && finalResponse) {
          setTimeout(() => {
            speakText(finalResponse!);
          }, 1000);
        }
      } catch (processingError) {
        console.error('Optimized processing failed, falling back to standard method:', processingError);
        
        // Track failed response
        performanceMonitor.trackResponse(startTime, false);
        
        // Fallback to original method
        const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
        
        if (!chatApiKey) {
          throw new Error('Venice AI Chat API key not configured. Please set VITE_VENICE_CHAT_API_KEY in your .env file.');
        }
        
        // Build enhanced context for AI
        const enhancedMessages = [
          {
            role: 'system',
            content: getEnhancedSystemPrompt(currentMode, messages, conversationContext)
          },
          ...messages.slice(-8).map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: (msg as any).imageUrl
              ? [
                  { type: 'text', text: msg.content },
                  { type: 'image_url', image_url: { url: (msg as any).imageUrl } }
                ]
              : msg.content
          })),
          {
            role: 'user',
            content: pastedImage
              ? [
                  { type: 'text', text: currentInput },
                  { type: 'image_url', image_url: { url: pastedImage } }
                ]
              : currentInput
          }
        ];
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'default',
            messages: enhancedMessages,
            max_tokens: optimizedAIConfig.maxTokens,
            temperature: optimizedAIConfig.temperature
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

        const assistantMessage = processAIResponse(aiResponse, currentInput);
        setMessages(prev => [...prev, assistantMessage]);
        
        // Track successful response
        performanceMonitor.trackResponse(startTime, true);

        // Clear the pasted image after successful processing
        if (pastedImage) {
          setPastedImage(null);
        }

        if (audioEnabled && !isRecording) {
          setTimeout(() => {
            speakText(aiResponse);
          }, 1000);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      
      // Track failed response
      performanceMonitor.trackResponse(startTime, false);
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

  // OCR text extraction function using Venice AI Vision
  const extractTextFromImage = async (imageDataUrl: string): Promise<string> => {
    try {
      const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
      
      if (!chatApiKey) {
        console.warn('Venice AI Chat API key not configured for OCR');
        return '';
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: 'You are an expert OCR system. Extract all visible text from images accurately. Return only the extracted text without any additional commentary or formatting. If no text is found, return an empty string.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please extract all text from this image. Return only the text content, nothing else.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.status}`);
      }

      const data = await response.json();
      const extractedText = data.choices?.[0]?.message?.content?.trim() || '';
      
      console.log('OCR extracted text:', extractedText);
      return extractedText;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return '';
    }
  };

  // Handle clipboard paste for images with OCR integration
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const imageDataUrl = event.target?.result as string;
            setPastedImage(imageDataUrl);
            
            // Simply set the image without any processing messages
            // The user can then type their prompt and send both together
            toast({
              title: 'Image Ready',
              description: 'Image pasted. Type your prompt and send to analyze together.',
            });
          };
          reader.onerror = () => {
            toast({
              title: 'Error',
              description: 'Failed to load the pasted image. Please try again.',
              variant: 'destructive',
            });
          };
          reader.readAsDataURL(file);
        } else {
          toast({
            title: 'Error',
            description: 'Invalid image data. Please try copying the image again.',
            variant: 'destructive',
          });
        }
        break;
      }
    }
  };

  // Remove pasted image
  const removePastedImage = () => {
    setPastedImage(null);
    setImagePrompt('');
  };

  // Handle image file upload from input button with OCR
  const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      toast({
        title: 'Processing Upload...',
        description: 'Loading image and extracting text content.',
      });
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setPastedImage(result);
        
        try {
          // Extract text from uploaded image using OCR
          const extractedText = await extractTextFromImage(result);
          
          if (extractedText.trim()) {
            // Auto-populate the text area with extracted text
            setInput(extractedText);
            setImagePrompt('OCR + Analysis');
            
            toast({
              title: 'Text Extracted!',
              description: `Found text: "${extractedText.substring(0, 50)}${extractedText.length > 50 ? '...' : ''}"`,
            });
          } else {
            setImagePrompt('Analyze this image and describe what you see');
            toast({
              title: 'Image Uploaded',
              description: 'No text detected. Image ready for analysis.',
            });
          }
        } catch (error) {
          console.error('OCR processing failed:', error);
          setImagePrompt('Analyze this image and describe what you see');
          toast({
            title: 'Upload Complete',
            description: 'Text extraction failed, but image is ready for analysis.',
          });
        }
        
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with enhanced OCR and AI analysis
  const processImageWithAI = async (imageDataUrl: string, prompt: string) => {
    setIsProcessingImage(true);
    try {
      // Extract text from image using Venice AI Vision
      const extractedText = await extractTextFromImage(imageDataUrl);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `${prompt}\n\n[Image attached for analysis]${extractedText ? `\n\nExtracted Text: "${extractedText}"` : ''}`,
        timestamp: new Date(),
        type: 'image',
        imageUrl: imageDataUrl
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Now process both the image and extracted text with AI
      const chatApiKey = import.meta.env.VITE_VENICE_CHAT_API_KEY;
      
      if (!chatApiKey) {
        throw new Error('Venice AI Chat API key not configured');
      }

      // Create comprehensive prompt that includes both image and text analysis
      const analysisPrompt = extractedText.trim() 
        ? `Please analyze this image and the extracted text together. 

User's request: "${prompt}"

Extracted text from image: "${extractedText}"

Please provide a comprehensive response that addresses both the visual content of the image and the extracted text. Consider how they relate to each other and the user's specific request.`
        : `Please analyze this image based on the user's request: "${prompt}". Describe what you see and provide helpful insights or assistance based on the visual content.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI assistant that can analyze both images and text. Provide comprehensive, helpful responses that address both visual and textual content when available.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: analysisPrompt },
                { type: 'image_url', image_url: { url: imageDataUrl } }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || 'Unable to analyze the image and text.';
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📸 **Image and Text Analysis Complete!**\n\n${analysis}${extractedText ? `\n\n**📝 Extracted Text:** "${extractedText}"` : ''}\n\n💡 **Next Steps:** You can ask follow-up questions about the image or text, request modifications, or ask for more specific analysis.`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Error processing image:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ **Image Analysis Failed**\n\nI encountered an error while analyzing your image. Please try again or describe what you see in the image manually.',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Processing Error',
        description: 'Failed to process image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
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
      // Turning OFF: stop any current speech/audio
      try { speechSynthesis.cancel(); } catch {}
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
        audioRef.current = null;
      }
      // Cancel any pending Venice TTS requests
      if (veniceTTSAbortRef.current) {
        veniceTTSAbortRef.current.abort();
        veniceTTSAbortRef.current = null;
      }
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
        
        const testResponse = await fetch('/api/generate-image', {
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
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
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
      selectedImageMessage: undefined,
      topicThread: [],
      conversationDepth: 0
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
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-50 flex flex-col`}>
      {/* Modern Figma-Style Header - Responsive */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link to="/" className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors">
            <div className="p-1 sm:p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </Link>
          
          <div className="w-px h-4 sm:h-5 bg-gray-300"></div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">AlgebrAI</h1>
              <p className="text-xs text-gray-500 -mt-0.5">AI Assistant</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-sm font-semibold text-gray-900">AlgebrAI</h1>
            </div>
          </div>
        </div>
      
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
            >
              {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
            >
              <Menu className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-49px)] sm:h-[calc(100vh-57px)] relative">
        {/* Modern Figma-Style Sidebar - Responsive */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:${sidebarOpen ? 'relative' : 'hidden'} z-40 w-64 sm:w-72 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto`}>
          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Model Selection */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                Model
              </h3>
              <div className="relative" ref={modelRef}>
                <button 
                  onClick={() => setModelOpen(!isModelOpen)} 
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-blue-50 border border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-gray-900 text-xs sm:text-sm font-semibold truncate">{selectedModel}</div>
                      <div className="text-gray-600 text-xs">AI Model</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 ${isModelOpen ? 'rotate-180' : ''} flex-shrink-0`} />
                </button>
                
                {isModelOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-sm">
                    {models.map((model, index) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className="w-full p-4 text-left hover:bg-blue-50 transition-all duration-200 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="text-gray-900 text-sm font-semibold">{model}</div>
                        <div className="text-gray-600 text-xs mt-1">
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
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                Mode
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { mode: 'general' as AIMode, icon: Brain, label: 'General' },
                  { mode: 'programming' as AIMode, icon: Code, label: 'Code' },
                  { mode: 'math' as AIMode, icon: Calculator, label: 'Math' },
                  { mode: 'photo' as AIMode, icon: Camera, label: 'Photo' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setCurrentMode(mode)}
                    className={`p-3 sm:p-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation min-h-[60px] sm:min-h-[auto] ${
                      currentMode === mode
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 text-blue-700'
                        : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs font-semibold">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                Quick Actions
              </h3>
              <div className="relative" ref={quickActionsRef}>
                <button 
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)} 
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-purple-50 border border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                  title="Quick Actions (⌘+K)"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-gray-900 text-xs sm:text-sm font-semibold truncate">Quick Actions</div>
                      <div className="text-gray-600 text-xs">Choose from templates</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''} flex-shrink-0`} />
                </button>
                
                {isQuickActionsOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl border border-gray-300 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="p-3">
                      <div className="text-xs text-gray-700 font-semibold px-3 py-2 mb-2 border-b border-gray-200 bg-gray-50 rounded-lg">Programming</div>
                      {quickActions.filter(action => action.category === 'Programming').map((action, index) => (
                        <button
                          key={`prog-${index}`}
                          onClick={() => {
                            handleQuickAction(action);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-gray-900 text-sm font-semibold truncate">{action.text}</div>
                            <div className="text-gray-600 text-xs truncate">{action.description}</div>
                          </div>
                        </button>
                      ))}
                      
                      <div className="text-xs text-gray-700 font-semibold px-3 py-2 mb-2 mt-4 border-b border-gray-200 bg-gray-50 rounded-lg">Mathematics</div>
                      {quickActions.filter(action => action.category === 'Mathematics').map((action, index) => (
                        <button
                          key={`math-${index}`}
                          onClick={() => {
                            handleQuickAction(action);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-gray-900 text-sm font-semibold truncate">{action.text}</div>
                            <div className="text-gray-600 text-xs truncate">{action.description}</div>
                          </div>
                        </button>
                      ))}
                      
                      <div className="text-xs text-gray-700 font-semibold px-3 py-2 mb-2 mt-4 border-b border-gray-200 bg-gray-50 rounded-lg">Photo Generation</div>
                      {quickActions.filter(action => action.category === 'Photo Generation').map((action, index) => (
                        <button
                          key={`photo-${index}`}
                          onClick={() => {
                            handleQuickAction(action);
                            setIsQuickActionsOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-gray-900 text-sm font-semibold truncate">{action.text}</div>
                            <div className="text-gray-600 text-xs truncate">{action.description}</div>
                          </div>
                        </button>
                      ))}
                      
                      <div className="text-xs text-gray-700 font-semibold px-3 py-2 mb-2 mt-4 border-b border-gray-200 bg-gray-50 rounded-lg">Photo Editing</div>
                       {quickActions.filter(action => action.category === 'Photo Editing').map((action, index) => (
                         <button
                           key={`edit-${index}`}
                           onClick={() => {
                             handleQuickAction(action);
                             setIsQuickActionsOpen(false);
                           }}
                           className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
                         >
                           <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                             <action.icon className="w-4 h-4 text-white" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <div className="text-gray-900 text-sm font-semibold truncate">{action.text}</div>
                             <div className="text-gray-600 text-xs truncate">{action.description}</div>
                           </div>
                         </button>
                       ))}
                       
                        <div className="text-xs text-gray-700 font-semibold px-3 py-2 mb-2 mt-4 border-b border-gray-200 bg-gray-50 rounded-lg">Photo Enhancement</div>
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
                            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-900 text-sm font-semibold truncate">{action.text}</div>
                              <div className="text-gray-600 text-xs truncate">{action.description}</div>
                            </div>
                          </button>
                        ))}
                        
                        <div className="text-xs text-gray-700 font-semibold px-3 py-2 mb-2 mt-4 border-b border-gray-200 bg-gray-50 rounded-lg">Testing</div>
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
                            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-900 text-sm font-semibold truncate">{action.text}</div>
                              <div className="text-gray-600 text-xs truncate">{action.description}</div>
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
              <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
                {/* Style Selection */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Image Style</h4>
                  <div className="relative">
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    >
                      {availableStyles.length > 0 ? (
                        availableStyles.map((style) => (
                          <option key={style} value={style} className="bg-white text-gray-900">
                            {style}
                          </option>
                        ))
                      ) : (
                        <option value="3D Model" className="bg-white text-gray-900">3D Model</option>
                      )}
                    </select>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Choose the artistic style for your generated images
                  </p>
                </div>

                {/* Realistic Image Help */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-900">Realistic Images</h4>
                    <Button
                      onClick={showRealisticImageHelp}
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      title="Realistic Image Guide"
                    >
                      <Lightbulb className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Generate photorealistic images with professional photography styles.
                  </p>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Photographic, Realistic, Photorealistic</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Professional Photography styles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>High Resolution & Quality options</span>
                    </div>
                  </div>
                </div>

                {/* API Setup Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Photo Generation Setup</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    To use photo generation, you need a valid API key from an image generation service.
                  </p>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Venice AI API (Recommended)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>OpenAI DALL-E API</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Stability AI API</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      Add your API key to the .env file as VITE_VENICE_IMAGE_API_KEY
                    </p>
                  </div>
                  
                  {/* API Testing */}
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">API Status</span>
                      <button
                        onClick={testAPI}
                        className="text-sm bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-xl border border-green-200 transition-all duration-200 font-medium"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat History */}
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-gray-900">Chat History</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={startNewChat}
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl group relative transition-all duration-200"
                    title="New Chat (⌘+N)"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={toggleHistory}
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl group relative transition-all duration-200"
                    title="Toggle History (⌘+H)"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {showHistory && (
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {chatSessions.length === 0 ? (
                    <div className="text-sm text-gray-600 p-4 text-center bg-gray-50 rounded-xl border border-gray-200">
                      No saved conversations
                    </div>
                  ) : (
                    chatSessions.map((session, index) => (
                      <div
                        key={session.id}
                        className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer animate-fade-in shadow-sm hover:shadow-md ${
                          currentSessionId === session.id
                            ? 'bg-blue-50 border-blue-200 shadow-md'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        style={{animationDelay: `${0.6 + index * 0.1}s`}}
                        onClick={() => loadSession(session)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold truncate ${
                              currentSessionId === session.id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {session.title}
                            </div>
                            <div className={`text-sm mt-1 ${
                              currentSessionId === session.id ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {session.messages.length} messages
                            </div>
                            <div className={`text-xs mt-1 ${
                              currentSessionId === session.id ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-50 rounded-lg"
                            title="Delete session"
                          >
                            <X className="w-4 h-4 text-red-500" />
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
              <h3 className="text-base font-semibold text-gray-900 mb-6">Chat Controls</h3>
              <div className="space-y-3">
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-12 text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  <RotateCcw className="w-5 h-5 mr-3 text-gray-500" />
                  Clear Chat
                </Button>
                <Button
                  onClick={() => {/* Export chat */}}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-12 text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  <Download className="w-5 h-5 mr-3 text-gray-500" />
                  Export Chat
                </Button>
                <Button
                  onClick={() => {/* Share chat */}}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-12 text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  <Share2 className="w-5 h-5 mr-3 text-gray-500" />
                  Share Chat
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Settings</h3>
              </div>
              
              <div className="space-y-5">
                <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                        <Volume2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-gray-900 text-base font-semibold block">Audio Response</span>
                        <span className="text-gray-500 text-sm">Enable voice responses from AI</span>
                      </div>
                    </div>
                    <button
                      onClick={toggleAudio}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                        audioEnabled ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                        audioEnabled ? 'translate-x-7' : 'translate-x-0.5'
                      }`}>
                        {audioEnabled && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center group-hover:from-yellow-200 group-hover:to-yellow-300 transition-all duration-300">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <span className="text-gray-900 text-base font-semibold block">Proactive Suggestions</span>
                        <span className="text-gray-500 text-sm">AI anticipates your questions</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setProactiveFeatures(prev => ({ ...prev, anticipateQuestions: !prev.anticipateQuestions }))}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                        proactiveFeatures.anticipateQuestions ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                        proactiveFeatures.anticipateQuestions ? 'translate-x-7' : 'translate-x-0.5'
                      }`}>
                        {proactiveFeatures.anticipateQuestions && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-gray-900 text-base font-semibold block">Related Topics</span>
                        <span className="text-gray-500 text-sm">Show topic suggestions</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setProactiveFeatures(prev => ({ ...prev, suggestRelatedTopics: !prev.suggestRelatedTopics }))}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                        proactiveFeatures.suggestRelatedTopics ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                        proactiveFeatures.suggestRelatedTopics ? 'translate-x-7' : 'translate-x-0.5'
                      }`}>
                        {proactiveFeatures.suggestRelatedTopics && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area - Figma Design */}
        <div className={`flex-1 flex flex-col bg-gray-50 transition-all duration-300 ${sidebarOpen ? '' : 'lg:ml-0'}`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 shadow-lg border border-gray-200/50">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-sm ${
                  connectionStatus === 'connected' ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200' : 
                  connectionStatus === 'connecting' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-yellow-200 animate-pulse' : 'bg-gradient-to-r from-red-400 to-red-500 shadow-red-200'
                }`}></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize tracking-wide hidden sm:inline">{connectionStatus}</span>
              </div>

            </div>
          </div>
          

            

          {/* Chat Messages - Figma Design */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 space-y-4 sm:space-y-6 md:space-y-8 bg-gradient-to-b from-gray-50/80 via-white/30 to-gray-50/60 backdrop-blur-sm"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20' 
                      : 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200/60 shadow-lg shadow-gray-900/10 ring-2 ring-gray-100/50'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white drop-shadow-sm" />
                    ) : (
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-700 drop-shadow-sm" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1">
                    {/* Message Bubble */}
                    <div className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 lg:px-7 py-3 sm:py-4 md:py-5 lg:py-6 transition-all duration-300 hover:scale-[1.02] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20'
                        : 'bg-white/90 backdrop-blur-sm border border-gray-200/60 text-gray-900 shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/15'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div 
                          className="text-xs sm:text-sm md:text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: formatAIResponse(message.content)
                          }}
                        />
                      ) : (
                        <div className="text-xs sm:text-sm md:text-sm leading-relaxed">
                          {message.content}
                        </div>
                      )}
                      
                      {message.type === 'voice' && message.audioUrl && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <audio controls className="w-full" src={message.audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      
                      {message.type === 'image' && message.imageUrl && (
                        <div className="mt-3 relative">
                          <div className={`relative ${imageSelectionMode ? 'cursor-pointer' : ''}`}>
                            <img 
                              src={message.imageUrl} 
                              alt="Generated Image"
                              className="w-full max-w-sm rounded-lg border border-gray-200"
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
                      
                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100/50">
                        <div className="text-xs font-medium text-gray-500 bg-gray-50/50 px-2 py-1 rounded-full">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                        
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-50/80 hover:bg-gray-100 border border-gray-200/60 text-gray-600 hover:text-gray-700 transition-all duration-200 hover:shadow-md hover:shadow-gray-200/50 group touch-manipulation"
                              title="Copy message"
                            >
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => likeMessage(message.id)}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-50/80 hover:bg-red-50 border border-gray-200/60 hover:border-red-200 text-gray-600 hover:text-red-600 transition-all duration-200 hover:shadow-md hover:shadow-red-200/50 group touch-manipulation"
                              title="Like message"
                            >
                              <Heart className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => shareMessage(message.content)}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-50/80 hover:bg-blue-50 border border-gray-200/60 hover:border-blue-200 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:shadow-md hover:shadow-blue-200/50 group touch-manipulation"
                              title="Share message"
                            >
                              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-50/80 hover:bg-red-50 border border-gray-200/60 hover:border-red-200 text-gray-600 hover:text-red-600 transition-all duration-200 hover:shadow-md hover:shadow-red-200/50 group touch-manipulation"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => startEditing(message.id)}
                              className="p-1.5 sm:p-2 rounded-lg bg-gray-50/80 hover:bg-green-50 border border-gray-200/60 hover:border-green-200 text-gray-600 hover:text-green-600 transition-all duration-200 hover:shadow-md hover:shadow-green-200/50 group touch-manipulation"
                              title="Edit message"
                            >
                              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
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
                <div className="flex items-start space-x-4 max-w-[75%]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200/60 flex items-center justify-center shadow-lg shadow-gray-900/10 ring-2 ring-gray-100/50 animate-pulse">
                    <Bot className="w-6 h-6 text-gray-700 drop-shadow-sm" />
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl px-6 py-5 shadow-xl shadow-gray-900/10">
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce shadow-lg shadow-blue-500/30"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce shadow-lg shadow-purple-500/30" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-bounce shadow-lg shadow-pink-500/30" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                      <span className="text-gray-600 text-sm font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Modern Input Area - Figma Design */}
          <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/90 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className={`transition-all duration-300 ${!sidebarOpen ? 'max-w-full w-full' : 'max-w-4xl mx-auto'}`}>
              {/* Input Container */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-gray-300/50 shadow-lg shadow-gray-200/50 overflow-visible hover:shadow-xl hover:shadow-gray-300/30 hover:border-gray-400/50 transition-all duration-300 hover:bg-white/95">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    {/* Add Button - Responsive */}
                    <div className="relative" ref={addPopupRef}>
                      <button 
                        onClick={() => setAddPopupOpen(!isAddPopupOpen)}
                        className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg transition-all duration-200 z-[10000] shadow-md hover:shadow-lg ${
                          isAddPopupOpen 
                            ? 'bg-blue-600 text-white shadow-blue-200' 
                            : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-2 border-blue-200 hover:border-blue-300'
                        }`}
                        title="Add content"
                        aria-label="Add content"
                      >
                        <Plus className={`w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-200 ${
                          isAddPopupOpen ? 'rotate-45' : ''
                        }`} />
                      </button>
                      
                      {isAddPopupOpen && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/50 z-[9998]"
                            onClick={() => setAddPopupOpen(false)}
                          />
                          
                          {/* Responsive Popup - Opens ABOVE the + button */}
                          <div className="absolute bottom-full left-0 mb-3 z-[9999] w-screen max-w-xs sm:max-w-sm md:max-w-md lg:w-80 xl:w-96">
                            <div className="mx-2 sm:mx-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
                              
                              {/* Compact Header */}
                              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/30">
                                <div className="flex items-center space-x-2">
                                  <Plus className="w-4 h-4 text-blue-400" />
                                  <span className="text-white text-sm font-medium">Add Content</span>
                                </div>
                                <button 
                                  onClick={() => setAddPopupOpen(false)}
                                  className="w-6 h-6 rounded-md bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                              
                              {/* Responsive Menu Items */}
                              <div className="p-1 max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto">
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
                                    className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 md:p-3 text-left transition-colors duration-150 rounded-lg hover:bg-gray-800/60 group"
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-800/40 flex items-center justify-center group-hover:bg-gray-700/60 transition-colors">
                                      <span className="text-sm sm:text-base">{item.icon}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-white text-xs sm:text-sm font-medium truncate">{item.text}</div>
                                      <div className="text-gray-400 text-xs hidden sm:block truncate mt-0.5">{item.description}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Current Mode Indicator */}
                    <div className={`flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 py-1 rounded-md bg-gray-100 border border-gray-200`}>
                      <div className={`${getModeColor(currentMode)}`}>
                        {getModeIcon(currentMode)}
                      </div>
                      <span className="text-gray-700 text-xs font-medium capitalize hidden sm:inline">{currentMode}</span>
                    </div>
                    
                    {/* Enhancement Menu Button */}
                    <div className="relative">
                      <button
                        onClick={() => setEnhancementMenuOpen(!isEnhancementMenuOpen)}
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-md transition-all duration-200 group touch-manipulation shadow-md hover:shadow-lg ${
                          isEnhancementMenuOpen
                            ? 'bg-purple-600 text-white shadow-purple-200 border-2 border-purple-300'
                            : 'bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700'
                        }`}
                        title="Enhancement Options"
                      >
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-medium hidden sm:inline">Enhance</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                          isEnhancementMenuOpen ? 'rotate-180' : 'group-hover:rotate-180'
                        }`} />
                      </button>
                      
                      {isEnhancementMenuOpen && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                            onClick={() => setEnhancementMenuOpen(false)}
                          />
                          {/* Enhancement Menu - Opens ABOVE the button */}
                          <div className="absolute bottom-full left-0 mb-1 z-[9999]">
                            <div className="w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                              <div className="p-0">
                                {/* Header */}
                                <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
                                  <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-purple-500" />
                                      <div>
                                        <div className="text-gray-900 font-semibold text-xs">Image Enhancement</div>
                                        <div className="text-gray-600 text-xs">Select enhancement options</div>
                                      </div>
                                    </div>
                                </div>
                                
                                {/* Menu Items - Complete list */}
                                <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                  <button
                                    onClick={() => {
                                      setEnhancementMenuOpen(false);
                                      setShowImageUpload(true);
                                    }}
                                    className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-blue-50 hover:border-blue-200 group"
                                  >
                                    <ImageIcon className="w-4 h-4 text-blue-500" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-gray-900 font-medium text-xs group-hover:text-blue-700">Upload & Enhance Image</div>
                                      <div className="text-gray-600 text-xs mt-0.5">Upload a new image for enhancement</div>
                                    </div>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setEnhancementMenuOpen(false);
                                      startImageSelection();
                                    }}
                                    className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-purple-50 hover:border-purple-200 group"
                                  >
                                    <Target className="w-4 h-4 text-purple-500" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-gray-900 font-medium text-xs group-hover:text-purple-700">Select Image from Chat</div>
                                      <div className="text-gray-600 text-xs mt-0.5">Choose an image from the conversation</div>
                                    </div>
                                  </button>
                                  
                                  {selectedImageId && (
                                    <button
                                      onClick={() => {
                                        setEnhancementMenuOpen(false);
                                        analyzeSelectedImage();
                                      }}
                                      className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-green-50 hover:border-green-200 group"
                                    >
                                      <MessageSquare className="w-4 h-4 text-green-500" />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-gray-900 font-medium text-xs group-hover:text-green-700">Analyze Selected Image</div>
                                        <div className="text-gray-600 text-xs mt-0.5">Get detailed analysis and suggestions</div>
                                      </div>
                                    </button>
                                  )}
                                  
                                  {/* NEW: Download All Images */}
                                  <button
                                    onClick={() => {
                                      setEnhancementMenuOpen(false);
                                      downloadAllImages();
                                    }}
                                    className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-orange-50 hover:border-orange-200 group"
                                  >
                                    <Download className="w-4 h-4 text-orange-500" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-gray-900 font-medium text-xs group-hover:text-orange-700">Download All Images</div>
                                      <div className="text-gray-600 text-xs mt-0.5">Download all generated images</div>
                                    </div>
                                  </button>
                                  
                                  {/* NEW: Test API Connection */}
                                  <button
                                    onClick={() => {
                                      setEnhancementMenuOpen(false);
                                      testAPI();
                                    }}
                                    className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-green-50 hover:border-green-200 group"
                                  >
                                    <Zap className="w-4 h-4 text-green-500" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-gray-900 font-medium text-xs group-hover:text-green-700">Test API Connection</div>
                                      <div className="text-gray-600 text-xs mt-0.5">Verify API connectivity</div>
                                    </div>
                                  </button>
                                  
                                  {/* NEW: Enhancement History */}
                                  {conversationContext.enhancementHistory.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setEnhancementMenuOpen(false);
                                        const historyMessage: Message = {
                                          id: Date.now().toString(),
                                          role: 'assistant',
                                          content: `📋 **Enhancement History**\n\nTotal enhancements: ${conversationContext.enhancementHistory.length}\n\n${conversationContext.enhancementHistory.map((item, index) => `${index + 1}. "${item.prompt}"`).join('\n')}\n\n**Current Selection:** ${conversationContext.selectedImageUrl ? 'Image selected' : 'No image selected'}`,
                                          timestamp: new Date(),
                                          type: 'text'
                                        };
                                        setMessages(prev => [...prev, historyMessage]);
                                        toast({
                                          title: 'Enhancement History',
                                          description: `Showing ${conversationContext.enhancementHistory.length} enhancements`,
                                        });
                                      }}
                                      className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-indigo-50 hover:border-indigo-200 group"
                                    >
                                      <History className="w-4 h-4 text-indigo-500" />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-gray-900 font-medium text-xs group-hover:text-indigo-700">Enhancement History</div>
                                        <div className="text-gray-600 text-xs mt-0.5">View all enhancement requests</div>
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
                                      className="w-full flex items-center space-x-2 p-3 text-left transition-all duration-200 rounded-lg border border-transparent hover:bg-red-50 hover:border-red-200 group"
                                    >
                                      <X className="w-4 h-4 text-red-500" />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-gray-900 font-medium text-xs group-hover:text-red-700">Clear Selection</div>
                                        <div className="text-gray-600 text-xs mt-0.5">Remove current image selection</div>
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
                    {/* Performance Monitor Button */}
                    <button 
                      onClick={() => {
                        const avgResponseTime = performanceMonitor.getAverageResponseTime();
                        const totalRequests = performanceMonitor.metrics.successRate + performanceMonitor.metrics.errorRate;
                        const successRate = totalRequests > 0 ? (performanceMonitor.metrics.successRate / totalRequests * 100).toFixed(1) : 0;
                        
                        const performanceMessage: Message = {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: `📊 **Performance Metrics**\n\n**Response Time:**\n• Average: ${avgResponseTime.toFixed(0)}ms\n• Total Requests: ${totalRequests}\n• Success Rate: ${successRate}%\n\n**Status:** ${avgResponseTime > 5000 ? '⚠️ Performance mode enabled' : '✅ Normal performance'}`,
                          timestamp: new Date(),
                          type: 'text'
                        };
                        setMessages(prev => [...prev, performanceMessage]);
                        
                        toast({
                          title: 'Performance Report',
                          description: `Avg response: ${avgResponseTime.toFixed(0)}ms, Success: ${successRate}%`,
                        });
                      }}
                      className="flex items-center justify-center w-7 h-7 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-md transition-all duration-300"
                      title="Performance Metrics"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    
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
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500'
                      }`}
                      title={audioEnabled ? 'Disable audio responses' : 'Enable audio responses'}
                    >
                      {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    {/* Voice Recording */}
                    <button 
                      onClick={handleMicClick}
                      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300 border ${
                        isRecording 
                          ? 'bg-red-500/30 hover:bg-red-500/40 border-red-500/50 text-red-300 animate-pulse' 
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600'
                      }`}
                      title={isRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Text Input */}
                <div className={`p-2 sm:p-3 transition-all duration-300 ease-in-out ${!sidebarOpen ? 'px-3 sm:px-4 lg:px-6' : 'px-2 sm:px-3'} border-t border-gray-200`}>
                  {/* Enhanced Quick suggestions */}
                  <div className={`mb-2 flex flex-wrap gap-1.5 sm:gap-2 transition-all duration-300 ${!sidebarOpen ? 'max-w-full w-full' : 'max-w-4xl mx-auto'}`}>
                    <button
                      type="button"
                      onClick={() => setInput('Explain this code snippet')}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg bg-gray-100 backdrop-blur-sm hover:bg-gray-200 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg touch-manipulation"
                    >
                      💻 <span className="hidden sm:inline">Explain this code</span><span className="sm:hidden">Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInput('Summarize these notes')}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg bg-gray-100 backdrop-blur-sm hover:bg-gray-200 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg touch-manipulation"
                    >
                      📝 <span className="hidden sm:inline">Summarize notes</span><span className="sm:hidden">Notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInput('Create a study plan for algebra')}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg bg-gray-100 backdrop-blur-sm hover:bg-gray-200 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg touch-manipulation"
                    >
                      📚 <span className="hidden sm:inline">Study plan</span><span className="sm:hidden">Study</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInput('Generate a photo prompt: ')}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg bg-gray-100 backdrop-blur-sm hover:bg-gray-200 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg touch-manipulation"
                    >
                      🎨 <span className="hidden sm:inline">Photo prompt</span><span className="sm:hidden">Photo</span>
                    </button>
                  </div>



                  {/* Professional Clean Interface - No Image Preview */}
                  <div className={`flex items-end space-x-2 sm:space-x-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm hover:border-gray-300 transition-all duration-300 focus-within:border-blue-400 focus-within:shadow-sm ${!sidebarOpen ? 'max-w-full w-full' : 'max-w-4xl mx-auto'}`}>
                    {/* Hidden image indicator for professional UX */}
                    {pastedImage && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <ImageIcon className="w-3 h-3" />
                        <span>Image ready</span>
                        <button
                          onClick={() => setPastedImage(null)}
                          className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex-1">
                        <textarea
                          ref={textareaRef}
                          className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none resize-none text-sm sm:text-base leading-relaxed min-h-[32px] sm:min-h-[36px] max-h-[120px] sm:max-h-[140px] transition-all duration-200 focus:placeholder-gray-300 touch-manipulation"
                          placeholder="Ask me anything... Press Enter to send, Shift+Enter for new line, Ctrl+V to paste images"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onPaste={handlePaste}
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
                      
                      {/* Image Upload Button */}
                      <button
                        onClick={() => document.getElementById('image-upload-input')?.click()}
                        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 touch-manipulation"
                        title="Upload image"
                      >
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      
                      {/* Hidden file input */}
                      <input
                        id="image-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      
                      {/* Enhanced Send Button */}
                      <button 
                        onClick={() => sendMessage()} 
                        disabled={isLoading || !input.trim()}
                        className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl transition-all duration-200 touch-manipulation ${
                          input.trim() && !isLoading
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200'
                        }`}
                        title={input.trim() ? 'Send message' : 'Type a message to send'}
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>

                  {/* Input hint */}
                  <div className={`mt-2 flex items-center justify-between text-xs sm:text-sm text-gray-400 transition-all duration-300 ${!sidebarOpen ? 'max-w-full w-full' : 'max-w-4xl mx-auto'}`}>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="px-2 py-1 rounded bg-gray-50 text-gray-500 text-xs">⏎ <span className="hidden sm:inline">Send</span></span>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span className="px-2 py-1 rounded bg-gray-50 text-gray-500 text-xs hidden sm:inline">⇧⏎ New line</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className={`px-2 py-1 rounded transition-colors text-xs ${
                        input.length > 1000 ? 'bg-red-50 text-red-600' :
                        input.length > 500 ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>{input.length}<span className="hidden sm:inline"> chars</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 text-xs text-gray-400 transition-all duration-300 ease-in-out space-y-2 sm:space-y-0 ${!sidebarOpen ? 'px-3 sm:px-6 lg:px-8' : 'px-3 sm:px-6'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                  <span className="hidden sm:inline">AI may make mistakes. Verify important information.</span>
                  <span className="sm:hidden text-xs">AI may make mistakes</span>
                  <div className="h-3 w-px bg-gray-200 hidden sm:block" />
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-50">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Connected to Venice AI</span>
                    <span className="sm:hidden">Connected</span>
                  </div>
                  {currentSessionId && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-gray-50">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span className="hidden sm:inline">Auto-saving</span>
                      <span className="sm:hidden">Saving</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
                  <span>{messages.length - 1}<span className="hidden sm:inline"> messages</span></span>
                  <span>•</span>
                  <span className="truncate max-w-20 sm:max-w-none">{selectedModel}</span>
                  {currentSessionId && (
                    <>
                      <span>•</span>
                      <span className="text-blue-500">Saved</span>
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
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


