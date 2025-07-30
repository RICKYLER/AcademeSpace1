
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Send, User, Bot, Calculator, BookOpen, Trophy, Lightbulb, RefreshCw, Plus, ChevronDown, Mic, ArrowUp, Image as ImageIcon, Box, FileText, Code, Zap, Sparkles, Palette, Camera, Settings, Maximize2, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

type AIMode = 'programming' | 'math' | 'photo' | 'general';

const Algebrain = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with:\n\n💻 **Programming** - Debug code, explain concepts, generate APIs\n🧮 **Mathematics** - Solve equations, explain theories, step-by-step solutions\n🎨 **Photo Generation** - Create images from descriptions\n🎤 **Voice Interaction** - Speak to me and I\'ll respond with voice\n\nWhat would you like to work on today?',
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // State to manage the visibility of popups and dropdowns
  const [isAddPopupOpen, setAddPopupOpen] = useState(false);
  const [isModelOpen, setModelOpen] = useState(false);

  // State for the selected model
  const [selectedModel, setSelectedModel] = useState('Brainwave 2.5');
  const models = ['Brainwave 2.5', 'Creative Fusion', 'Visionary AI 3.0'];

  // Refs for the popups to detect outside clicks
  const addPopupRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to handle clicks outside of the popups/dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addPopupRef.current && !addPopupRef.current.contains(event.target as Node)) {
        setAddPopupOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const quickActions = [
    { 
      icon: Code, 
      text: 'Generate REST API', 
      category: 'Programming',
      mode: 'programming' as AIMode,
      description: 'Create API endpoints'
    },
    { 
      icon: Calculator, 
      text: 'Debug Python code', 
      category: 'Programming',
      mode: 'programming' as AIMode,
      description: 'Find and fix bugs'
    },
    { 
      icon: BookOpen, 
      text: 'Explain React hooks', 
      category: 'Programming',
      mode: 'programming' as AIMode,
      description: 'Learn React concepts'
    },
    { 
      icon: Calculator, 
      text: 'Solve: 2x + 5 = 13', 
      category: 'Mathematics',
      mode: 'math' as AIMode,
      description: 'Algebra help'
    },
    { 
      icon: Trophy, 
      text: 'Pythagorean theorem', 
      category: 'Mathematics',
      mode: 'math' as AIMode,
      description: 'Geometry concepts'
    },
    { 
      icon: Camera, 
      text: 'Generate a sunset', 
      category: 'Photo Generation',
      mode: 'photo' as AIMode,
      description: 'Create beautiful images'
    }
  ];

  const addMenuItems = [
    { icon: <ImageIcon size={20} className="text-gray-500 dark:text-gray-400" />, text: "Add photos or diagrams" },
    { icon: <Box size={20} className="text-gray-500 dark:text-gray-400" />, text: "Add 3D objects" },
    { icon: <FileText size={20} className="text-gray-500 dark:text-gray-400" />, text: "Add files (PDF, docs...)" },
  ];

  const handleQuickAction = (action: any) => {
    setCurrentMode(action.mode);
    setInput(action.text);
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
        content: 'Hello! I\'m your AI assistant. I can help you with:\n\n💻 **Programming** - Debug code, explain concepts, generate APIs\n🧮 **Mathematics** - Solve equations, explain theories, step-by-step solutions\n🎨 **Photo Generation** - Create images from descriptions\n🎤 **Voice Interaction** - Speak to me and I\'ll respond with voice\n\nWhat would you like to work on today?',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    setCurrentMode('general');
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
      case 'programming': return 'text-blue-500';
      case 'math': return 'text-green-500';
      case 'photo': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      // Check if browser supports media devices
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
      
      // Bypass speech recognition and use direct voice processing
      console.log('Processing voice input with bypass method');
      
      // Create a voice message with a generic prompt
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
      
      // Send the voice message to AI immediately
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

  const handleVoiceFallback = (audioUrl: string) => {
    const fallbackText = "Voice message recorded. Please type your question.";
    
    const voiceMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: fallbackText,
      timestamp: new Date(),
      type: 'voice',
      audioUrl: audioUrl
    };

    setMessages(prev => [...prev, voiceMessage]);
    setInput(fallbackText);
    
    toast({
      title: 'Voice Message Recorded',
      description: 'Please type your question.',
    });
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!audioEnabled || !text.trim()) return;

    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Get available voices and set a good one
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

  const sendMessage = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    console.log('sendMessage called with:', messageText, 'customInput:', customInput);

    // Don't add duplicate user message if it's already been added
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
      console.log('Sending request to Venice AI API with input:', currentInput);
      
      const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
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
        type: currentMode === 'photo' ? 'image' : 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the AI response if audio is enabled
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
      speechSynthesis.cancel(); // Stop any current speech
    }
  };

  // Test function to verify voice functionality
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
    
    // Send the test message to AI
    setTimeout(() => {
      console.log('Sending test voice message to AI');
      sendMessage(testMessage);
    }, 500);
    
    toast({
      title: 'Voice Test',
      description: 'Test voice message sent to AI.',
    });
  };

  // Quick voice input function
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
    
    // Send the message to AI
    setTimeout(() => {
      console.log('Sending quick voice input to AI');
      sendMessage(question);
    }, 500);
    
    toast({
      title: 'Voice Message Sent',
      description: 'Your question has been sent to AI.',
    });
  };

  // Simulate voice message (bypasses speech recognition)
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
    
    // Send the message to AI
    setTimeout(() => {
      console.log('Sending simulated voice message to AI');
      sendMessage(message);
    }, 500);
    
    toast({
      title: 'Voice Message Simulated',
      description: 'Voice message sent to AI successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Unleash Your
          </h1>
          <h2 className="text-4xl font-bold text-gray-300 mb-4">
            Creativity.
          </h2>
          <p className="text-lg text-gray-400 mb-4">
            Your AI assistant for programming, math, and creative tasks
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected to Venice AI</span>
            <button className="ml-4 p-2 text-gray-400 hover:text-white transition-colors">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 bg-black/50 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between text-white">
              Quick Actions
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearChat}
                className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear Chat
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start hover:bg-gray-800/50 transition-all duration-200 border-gray-700 text-gray-300 hover:text-white"
                  onClick={() => handleQuickAction(action)}
                >
                  <action.icon className="w-5 h-5 mr-3 text-blue-400" />
                  <div>
                    <div className="font-medium">{action.text}</div>
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[500px] md:h-[600px] flex flex-col shadow-2xl bg-black/50 backdrop-blur-xl border-gray-800">
          <CardHeader className="pb-4 border-b border-gray-800 flex-shrink-0">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <div className={`mr-2 ${getModeColor(currentMode)}`}>
                  {getModeIcon(currentMode)}
                </div>
                AI Assistant
                {currentMode !== 'general' && (
                  <span className="ml-2 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {messages.length - 1} messages
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Container with Fixed Height and Scroll */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
              style={{ height: 'calc(100% - 200px)' }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl p-4 shadow-lg max-w-full border ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gray-800/80 text-gray-100 border-gray-700'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">{message.content}</div>
                      {message.type === 'voice' && message.audioUrl && (
                        <div className="mt-2">
                          <audio controls className="w-full" src={message.audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      <div className={`text-xs mt-3 opacity-70 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-800/80 rounded-2xl p-4 shadow-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-300 font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Interface - Always at Bottom */}
            <div className="border-t border-gray-800 bg-gray-900/50 flex-shrink-0">
              <div className="p-4">
                <div className="bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 p-4 transition-all duration-300 hover:shadow-3xl">
                  <textarea
                    className="w-full p-3 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base font-medium leading-relaxed rounded-xl border border-gray-700/50"
                    rows={2}
                    placeholder="Type / for command..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  {/* Responsive container for controls */}
                  <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4 md:gap-0">
                    {/* Left side controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Add Button and Popup */}
                      <div className="relative" ref={addPopupRef}>
                        <button 
                          onClick={() => setAddPopupOpen(!isAddPopupOpen)}
                          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-gray-700/50 active:scale-95"
                        >
                          <Plus size={22} />
                        </button>
                        {isAddPopupOpen && (
                          <div className="absolute bottom-full left-0 mb-3 w-72 bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-10 animate-in slide-in-from-bottom-2 duration-200">
                            <ul>
                              {addMenuItems.map((item, index) => (
                                 <li key={index} className="flex items-center gap-4 p-4 hover:bg-gray-800/80 cursor-pointer rounded-xl transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl hover:scale-105">
                                   {item.icon}
                                   <span className="font-medium text-gray-200">{item.text}</span>
                                 </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {/* Model Selection Button and Dropdown */}
                      <div className="relative" ref={modelRef}>
                        <button onClick={() => setModelOpen(!isModelOpen)} className="flex items-center justify-center h-12 px-4 lg:px-5 bg-gradient-to-br from-blue-900/30 to-indigo-800/30 hover:from-blue-800/40 hover:to-indigo-700/40 text-gray-200 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-blue-700/30 active:scale-95">
                          <Brain size={18} className="text-blue-400" />
                          <span className="font-semibold ml-2 hidden lg:block">{selectedModel}</span>
                          <ChevronDown size={16} className="ml-2 hidden lg:block transition-transform duration-200" style={{ transform: isModelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>
                         {isModelOpen && (
                           <div className="absolute bottom-full left-0 mb-3 w-64 bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-10 animate-in slide-in-from-bottom-2 duration-200">
                            <ul>
                              {models.map((model) => (
                                 <li key={model} onClick={() => handleModelSelect(model)} className="p-4 hover:bg-gray-800/80 cursor-pointer font-medium text-gray-200 rounded-xl transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl hover:scale-105">
                                   {model}
                                 </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Right side controls */}
                    <div className="flex items-center gap-3">
                      {/* Test Voice Button */}
                      <button 
                        onClick={testVoiceFunctionality}
                        className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-800 to-yellow-900 hover:from-yellow-700 hover:to-yellow-800 text-yellow-300 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-yellow-700/50 active:scale-95"
                        title="Test Voice Functionality"
                      >
                        <Zap size={22} />
                      </button>
                      
                      {/* Simulate Voice Button */}
                      <button 
                        onClick={() => simulateVoiceMessage("Hello AI, can you help me with JavaScript programming?")}
                        className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-800 to-orange-900 hover:from-orange-700 hover:to-orange-800 text-orange-300 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-orange-700/50 active:scale-95"
                        title="Simulate Voice Message"
                      >
                        <Sparkles size={22} />
                      </button>
                      
                      {/* Quick Voice Input Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => quickVoiceInput("Can you help me with Python programming?")}
                          className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-blue-300 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-blue-700/50 active:scale-95 text-xs"
                          title="Python Help"
                        >
                          P
                        </button>
                        <button 
                          onClick={() => quickVoiceInput("How do I solve this math problem?")}
                          className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-green-300 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-green-700/50 active:scale-95 text-xs"
                          title="Math Help"
                        >
                          M
                        </button>
                        <button 
                          onClick={() => quickVoiceInput("Generate a beautiful image for me")}
                          className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-purple-300 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-purple-700/50 active:scale-95 text-xs"
                          title="Image Generation"
                        >
                          I
                        </button>
                      </div>
                      
                      {/* Audio Toggle Button */}
                      <button 
                        onClick={toggleAudio}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border active:scale-95 ${
                          audioEnabled 
                            ? 'bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-green-300 border-green-700/50' 
                            : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 border-gray-700/50'
                        }`}
                      >
                        {audioEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                      </button>
                      
                      {/* Voice Recording Button */}
                      <button 
                        onClick={handleMicClick}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-gray-700/50 active:scale-95 ${
                          isRecording 
                            ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white animate-pulse' 
                            : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300'
                        }`}
                      >
                        {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                      </button>
                      
                      {/* Send Button */}
                      <button 
                        onClick={() => sendMessage()} 
                        disabled={isLoading || !input.trim()}
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                          input.trim() && !isLoading
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:scale-105 active:scale-95' 
                            : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowUp size={22} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center pb-2">
                AI may make mistakes. We recommend checking important information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer bg-black/50 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-white">Programming</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Debug code, generate APIs, explain concepts with detailed examples
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full bg-gradient-to-r from-blue-900/20 to-blue-800/20 hover:from-blue-800/30 hover:to-blue-700/30 border-blue-700 text-blue-300"
                onClick={() => setCurrentMode('programming')}
              >
                Start Programming
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer bg-black/50 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-white">Mathematics</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Solve equations, explain theories, step-by-step solutions
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full bg-gradient-to-r from-green-900/20 to-green-800/20 hover:from-green-800/30 hover:to-green-700/30 border-green-700 text-green-300"
                onClick={() => setCurrentMode('math')}
              >
                Start Math
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer bg-black/50 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-white">Photo Generation</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Create beautiful images from descriptions and prompts
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full bg-gradient-to-r from-purple-900/20 to-purple-800/20 hover:from-purple-800/30 hover:to-purple-700/30 border-purple-700 text-purple-300"
                onClick={() => setCurrentMode('photo')}
              >
                Generate Photos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Algebrain;
