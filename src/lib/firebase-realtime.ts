import { initializeApp, getApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, off, serverTimestamp, query, orderByChild, limitToLast } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWvkHHdr7JnnTXnipT9yfQq63mlh32Q-c",
  authDomain: "chat-62000.firebaseapp.com",
  projectId: "chat-62000",
  storageBucket: "chat-62000.firebasestorage.app",
  messagingSenderId: "493553457166",
  appId: "1:493553457166:web:9af993df11a5fbe87b045f",
  measurementId: "G-3J2GC1ZC42",
  databaseURL: "https://chat-62000-default-rtdb.firebaseio.com"
};

// Initialize Firebase (check if app already exists)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // App already exists, get the existing one
  app = getApp();
}

const database = getDatabase(app);
const auth = getAuth(app);

// Database references
export const dbRefs = {
  messages: (conversationId: string) => ref(database, `messages/${conversationId}`),
  conversations: () => ref(database, 'conversations'),
  users: () => ref(database, 'users'),
  typing: (conversationId: string) => ref(database, `typing/${conversationId}`),
  presence: (userId: string) => ref(database, `presence/${userId}`),
  // Realtime student performance stats: stats/{studentId}
  stats: (studentId: string) => ref(database, `stats/${studentId}`)
};

// Initialize anonymous auth
export const initializeRealtimeAuth = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
};

// Message functions
export const addRealtimeMessage = async (conversationId: string, messageData: {
  sender: string;
  senderId: string;
  content: string;
  timestamp?: any;
  isMe?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  fileData?: any;
}) => {
  try {
    const messageRef = ref(database, `messages/${conversationId}`);
    const newMessageRef = push(messageRef);
    
    await set(newMessageRef, {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return newMessageRef;
  } catch (error) {
    console.error('Error adding realtime message:', error);
    throw error;
  }
};

// Listen to messages for a conversation
export const listenToRealtimeMessages = (conversationId: string, callback: (messages: any[]) => void) => {
  const messagesRef = dbRefs.messages(conversationId);
  const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));

  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    const messages: any[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      messages.push({
        id: childSnapshot.key,
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      });
    });
    callback(messages);
  });

  return unsubscribe;
};

// Conversation functions
export const addRealtimeConversation = async (conversationData: {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  timestamp?: any;
  unread?: number;
  avatar?: string;
  isOnline?: boolean;
}) => {
  try {
    const conversationRef = ref(database, `conversations/${conversationData.id}`);
    
    await set(conversationRef, {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return conversationRef;
  } catch (error) {
    console.error('Error adding realtime conversation:', error);
    throw error;
  }
};

// User presence functions
export const setUserPresence = async (userId: string, userData: {
  username: string;
  isOnline: boolean;
  lastSeen?: any;
}) => {
  try {
    const presenceRef = dbRefs.presence(userId);
    
    await set(presenceRef, {
      ...userData,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return presenceRef;
  } catch (error) {
    console.error('Error setting user presence:', error);
    throw error;
  }
};

// Typing indicator functions
export const setRealtimeTypingStatus = async (conversationId: string, typingData: {
  userId: string;
  username: string;
  isTyping: boolean;
}) => {
  try {
    const typingRef = ref(database, `typing/${conversationId}/${typingData.userId}`);
    
    if (typingData.isTyping) {
      await set(typingRef, {
        ...typingData,
        timestamp: serverTimestamp()
      });
    } else {
      await set(typingRef, null); // Remove typing indicator
    }
    
    return typingRef;
  } catch (error) {
    console.error('Error setting realtime typing status:', error);
    throw error;
  }
};

// Listen to typing indicators
export const listenToTypingStatus = (conversationId: string, callback: (typingUsers: any[]) => void) => {
  const typingRef = dbRefs.typing(conversationId);

  const unsubscribe = onValue(typingRef, (snapshot) => {
    const typingUsers: any[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data && data.isTyping) {
        typingUsers.push({
          userId: childSnapshot.key,
          username: data.username,
          timestamp: data.timestamp
        });
      }
    });
    callback(typingUsers);
  });

  return unsubscribe;
};

// Listen to user presence
export const listenToUserPresence = (userId: string, callback: (presence: any) => void) => {
  const presenceRef = dbRefs.presence(userId);

  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const presence = snapshot.val();
    callback(presence);
  });

  return unsubscribe;
};

// Cleanup function
export const cleanupRealtimeListeners = () => {
  // Note: off() without arguments disconnects all listeners
  // For specific cleanup, you should store and call the unsubscribe functions
  // returned by onValue() calls
};

export { app, database, auth }; 

// =============================
// Realtime Student Stats (NEW)
// =============================

export interface StudentMetric {
  value: number;
  percentage: number;
  trend?: string;
}

export interface StudentTrendPoint {
  month: string;
  IQ?: number;
  EQ?: number;
  Mental?: number;
  Math?: number;
  Comp?: number;
}

export interface StudentStatsPayload {
  metrics?: {
    IQ?: StudentMetric;
    EQ?: StudentMetric;
    Mental?: StudentMetric;
    Math?: StudentMetric;
    Comp?: StudentMetric;
  };
  trends?: StudentTrendPoint[];
}

// Listen to realtime student stats at stats/{studentId}
export const listenToStudentStats = (
  studentId: string,
  callback: (stats: StudentStatsPayload | null) => void
) => {
  const statsRef = dbRefs.stats(studentId);
  const unsubscribe = onValue(statsRef, (snapshot) => {
    const data = snapshot.val() as StudentStatsPayload | null;
    callback(data);
  });
  return unsubscribe;
};

// Optional helper to update stats (useful for local testing/demo)
export const setStudentStats = async (
  studentId: string,
  data: StudentStatsPayload
) => {
  const statsRef = dbRefs.stats(studentId);
  await set(statsRef, data);
  return statsRef;
};