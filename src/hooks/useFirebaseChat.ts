import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  addMessage, 
  listenToMessages, 
  addUser, 
  setTypingStatus 
} from '../lib/firebase';
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

interface UseFirebaseChatReturn {
  messages: Message[];
  typingUsers: string[];
  isConnected: boolean;
  sendMessage: (conversationId: string, message: string, sender: string, senderId: string) => Promise<void>;
  sendTypingStart: (conversationId: string, sender: string, userId: string) => Promise<void>;
  sendTypingStop: (conversationId: string, sender: string, userId: string) => Promise<void>;
  setUserOnline: (userId: string, username: string) => Promise<void>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

export const useFirebaseChat = (): UseFirebaseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  const unsubscribeRefs = useRef<{
    messages?: () => void;
    typing?: () => void;
  }>({});

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
    setIsConnected(true);

    // Listen to messages (using Realtime Database for better performance)
    const unsubscribeMessages = listenToRealtimeMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
    });

    // Listen to typing indicators
    const unsubscribeTyping = listenToTypingStatus(conversationId, (typingUsers) => {
      setTypingUsers(typingUsers.map(user => user.username));
    });

    unsubscribeRefs.current.messages = unsubscribeMessages;
    unsubscribeRefs.current.typing = unsubscribeTyping;
  }, [currentConversationId]);

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
      setIsConnected(false);
      setMessages([]);
      setTypingUsers([]);
    }
  }, [currentConversationId]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, message: string, sender: string, senderId: string) => {
    if (!message.trim()) return;

    try {
      // Save to both Firestore (for persistence) and Realtime Database (for real-time)
      await Promise.all([
        addMessage({
          conversationId,
          sender,
          senderId,
          content: message.trim(),
          status: 'sent'
        }),
        addRealtimeMessage(conversationId, {
          sender,
          senderId,
          content: message.trim(),
          status: 'sent'
        })
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to Realtime Database only
      await addRealtimeMessage(conversationId, {
        sender,
        senderId,
        content: message.trim(),
        status: 'sent'
      });
    }
  }, []);

  // Send typing start
  const sendTypingStart = useCallback(async (conversationId: string, sender: string, userId: string) => {
    try {
      await Promise.all([
        setTypingStatus({
          conversationId,
          userId,
          username: sender,
          isTyping: true
        }),
        setRealtimeTypingStatus(conversationId, {
          userId,
          username: sender,
          isTyping: true
        })
      ]);
    } catch (error) {
      console.error('Error setting typing start:', error);
      // Fallback to Realtime Database only
      await setRealtimeTypingStatus(conversationId, {
        userId,
        username: sender,
        isTyping: true
      });
    }
  }, []);

  // Send typing stop
  const sendTypingStop = useCallback(async (conversationId: string, sender: string, userId: string) => {
    try {
      await Promise.all([
        setTypingStatus({
          conversationId,
          userId,
          username: sender,
          isTyping: false
        }),
        setRealtimeTypingStatus(conversationId, {
          userId,
          username: sender,
          isTyping: false
        })
      ]);
    } catch (error) {
      console.error('Error setting typing stop:', error);
      // Fallback to Realtime Database only
      await setRealtimeTypingStatus(conversationId, {
        userId,
        username: sender,
        isTyping: false
      });
    }
  }, []);

  // Set user online
  const setUserOnline = useCallback(async (userId: string, username: string) => {
    try {
      await Promise.all([
        addUser({
          userId,
          username,
          isOnline: true
        }),
        setUserPresence(userId, {
          username,
          isOnline: true
        })
      ]);
    } catch (error) {
      console.error('Error setting user online:', error);
      // Fallback to Realtime Database only
      await setUserPresence(userId, {
        username,
        isOnline: true
      });
    }
  }, []);

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

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    setUserOnline,
    joinConversation,
    leaveConversation
  };
};

export default useFirebaseChat; 