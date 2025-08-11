import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { initializeAuth, addMessage, listenToMessages, addUser, setTypingStatus } from '../lib/firebase';

interface Message {
  id: string;
  sender: string;
  senderId?: string;
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
  fileData?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: string, sender: string, senderId: string) => void;
  sendTypingStart: (conversationId: string, sender: string) => void;
  sendTypingStop: (conversationId: string, sender: string) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  shareFile: (conversationId: string, fileData: any, sender: string, senderId: string) => void;
  setUserOnline: (userId: string, username: string) => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Firebase auth and socket connection
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Firebase auth
        const user = await initializeAuth();
        console.log('Firebase auth initialized:', user?.uid);

        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from socket server');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        setSocket(newSocket);
        socketRef.current = newSocket;
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, message: string, sender: string, senderId: string) => {
    if (socketRef.current && message.trim()) {
      try {
        // Save message to Firebase
        await addMessage({
          conversationId,
          sender,
          senderId,
          content: message.trim(),
          status: 'sent'
        });
        
        // Send via Socket.IO
        socketRef.current.emit('send_message', {
          conversationId,
          message: message.trim(),
          sender,
          senderId
        });
      } catch (error) {
        console.error('Error sending message:', error);
        // Fallback to Socket.IO only
        socketRef.current.emit('send_message', {
          conversationId,
          message: message.trim(),
          sender,
          senderId
        });
      }
    }
  }, []);

  const sendTypingStart = useCallback(async (conversationId: string, sender: string) => {
    if (socketRef.current) {
      try {
        // Save typing status to Firebase
        await setTypingStatus({
          conversationId,
          userId: socketRef.current.id || 'unknown',
          username: sender,
          isTyping: true
        });
        
        // Send via Socket.IO
        socketRef.current.emit('typing_start', { conversationId, sender });
      } catch (error) {
        console.error('Error setting typing start:', error);
        // Fallback to Socket.IO only
        socketRef.current.emit('typing_start', { conversationId, sender });
      }
    }
  }, []);

  const sendTypingStop = useCallback(async (conversationId: string, sender: string) => {
    if (socketRef.current) {
      try {
        // Save typing status to Firebase
        await setTypingStatus({
          conversationId,
          userId: socketRef.current.id || 'unknown',
          username: sender,
          isTyping: false
        });
        
        // Send via Socket.IO
        socketRef.current.emit('typing_stop', { conversationId, sender });
      } catch (error) {
        console.error('Error setting typing stop:', error);
        // Fallback to Socket.IO only
        socketRef.current.emit('typing_stop', { conversationId, sender });
      }
    }
  }, []);

  const markAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { conversationId, messageIds });
    }
  }, []);

  const shareFile = useCallback((conversationId: string, fileData: any, sender: string, senderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('share_file', {
        conversationId,
        fileData,
        sender,
        senderId
      });
    }
  }, []);

  const setUserOnline = useCallback(async (userId: string, username: string) => {
    if (socketRef.current) {
      try {
        // Save user status to Firebase
        await addUser({
          userId,
          username,
          isOnline: true
        });
        
        // Send via Socket.IO
        socketRef.current.emit('user_online', { userId, username });
      } catch (error) {
        console.error('Error setting user online:', error);
        // Fallback to Socket.IO only
        socketRef.current.emit('user_online', { userId, username });
      }
    }
  }, []);

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
    shareFile,
    setUserOnline
  };
};

export default useSocket; 