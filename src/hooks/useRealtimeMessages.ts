import { useEffect, useRef, useState, useCallback } from 'react';
import {
  addRealtimeMessage,
  listenToRealtimeMessages,
  setUserPresence,
  setRealtimeTypingStatus,
  listenToTypingStatus,
  listenToUserPresence,
  cleanupRealtimeListeners
} from '../lib/firebase-realtime';

interface Message {
  id: string;
  sender: string;
  senderId?: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  fileData?: any;
}

interface UseRealtimeMessagesReturn {
  messages: Message[];
  typingUsers: string[];
  isConnected: boolean;
  sendMessage: (conversationId: string, message: string, sender: string, senderId: string) => Promise<void>;
  sendTypingStart: (conversationId: string, sender: string, userId: string) => Promise<void>;
  sendTypingStop: (conversationId: string, sender: string, userId: string) => Promise<void>;
  setUserOnline: (userId: string, username: string) => Promise<void>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  getConnectionStatus: () => string;
}

export const useRealtimeMessages = (): UseRealtimeMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const unsubscribeRefs = useRef<{
    messages?: () => void;
    typing?: () => void;
  }>({});

  const pendingMessages = useRef<Message[]>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connection status management
  const updateConnectionStatus = useCallback((status: 'connecting' | 'connected' | 'disconnected') => {
    setConnectionStatus(status);
    setIsConnected(status === 'connected');
  }, []);

  // Reconnection logic
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      updateConnectionStatus('connecting');
      
      setTimeout(() => {
        if (currentConversationId) {
          joinConversation(currentConversationId);
        }
      }, 1000 * reconnectAttempts.current); // Exponential backoff
    }
  }, [currentConversationId]);

  // Join a conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (currentConversationId === conversationId) return;
    
    // Cleanup previous listeners
    if (unsubscribeRefs.current.messages) {
      unsubscribeRefs.current.messages();
    }
    if (unsubscribeRefs.current.typing) {
      unsubscribeRefs.current.typing();
    }

    setCurrentConversationId(conversationId);
    updateConnectionStatus('connecting');

    try {
      // Listen to messages with error handling
      const unsubscribeMessages = listenToRealtimeMessages(conversationId, (newMessages) => {
        setMessages(newMessages);
        updateConnectionStatus('connected');
        reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
        
        // Send any pending messages
        if (pendingMessages.current.length > 0) {
          pendingMessages.current.forEach(async (pendingMsg) => {
            try {
              await addRealtimeMessage(conversationId, {
                sender: pendingMsg.sender,
                senderId: pendingMsg.senderId,
                content: pendingMsg.content,
                status: 'sent'
              });
            } catch (error) {
              console.error('Error sending pending message:', error);
            }
          });
          pendingMessages.current = [];
        }
      });

      // Listen to typing indicators
      const unsubscribeTyping = listenToTypingStatus(conversationId, (typingUsers) => {
        setTypingUsers(typingUsers.map(user => user.username));
      });

      unsubscribeRefs.current.messages = unsubscribeMessages;
      unsubscribeRefs.current.typing = unsubscribeTyping;
    } catch (error) {
      console.error('Error joining conversation:', error);
      updateConnectionStatus('disconnected');
      attemptReconnect();
    }
  }, [currentConversationId, updateConnectionStatus, attemptReconnect]);

  // Leave a conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (currentConversationId === conversationId) {
      // Cleanup listeners
      if (unsubscribeRefs.current.messages) {
        unsubscribeRefs.current.messages();
        unsubscribeRefs.current.messages = undefined;
      }
      if (unsubscribeRefs.current.typing) {
        unsubscribeRefs.current.typing();
        unsubscribeRefs.current.typing = undefined;
      }
      
      setCurrentConversationId(null);
      updateConnectionStatus('disconnected');
      setMessages([]);
      setTypingUsers([]);
      pendingMessages.current = [];
    }
  }, [currentConversationId, updateConnectionStatus]);

  // Send a message with enhanced error handling
  const sendMessage = useCallback(async (conversationId: string, message: string, sender: string, senderId: string) => {
    if (!message.trim()) return;

    const messageData = {
      sender,
      senderId,
      content: message.trim(),
      status: 'sent' as const
    };

    try {
      if (isConnected) {
        await addRealtimeMessage(conversationId, messageData);
      } else {
        // Store message for later sending
        pendingMessages.current.push({
          id: Date.now().toString(),
          ...messageData,
          timestamp: new Date().toISOString(),
          isMe: true
        });
        console.log('Message queued for later sending');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add to pending messages if connection failed
      pendingMessages.current.push({
        id: Date.now().toString(),
        ...messageData,
        timestamp: new Date().toISOString(),
        isMe: true
      });
    }
  }, [isConnected]);

  // Send typing start with debouncing
  const sendTypingStart = useCallback(async (conversationId: string, sender: string, userId: string) => {
    if (!isConnected) return;
    
    try {
      await setRealtimeTypingStatus(conversationId, {
        userId,
        username: sender,
        isTyping: true
      });
    } catch (error) {
      console.error('Error setting typing start:', error);
    }
  }, [isConnected]);

  // Send typing stop
  const sendTypingStop = useCallback(async (conversationId: string, sender: string, userId: string) => {
    if (!isConnected) return;
    
    try {
      await setRealtimeTypingStatus(conversationId, {
        userId,
        username: sender,
        isTyping: false
      });
    } catch (error) {
      console.error('Error setting typing stop:', error);
    }
  }, [isConnected]);

  // Set user online with presence tracking
  const setUserOnline = useCallback(async (userId: string, username: string) => {
    try {
      await setUserPresence(userId, {
        username,
        isOnline: true
      });
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  }, []);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'read' as const }
        : msg
    ));
  }, []);

  // Delete message (local only for now)
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  }, [connectionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRefs.current.messages) {
        unsubscribeRefs.current.messages();
      }
      if (unsubscribeRefs.current.typing) {
        unsubscribeRefs.current.typing();
      }
      cleanupRealtimeListeners();
    };
  }, []);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (connectionStatus === 'disconnected' && currentConversationId) {
      const timeout = setTimeout(() => {
        attemptReconnect();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [connectionStatus, currentConversationId, attemptReconnect]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    setUserOnline,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    deleteMessage,
    getConnectionStatus
  };
};

export default useRealtimeMessages; 