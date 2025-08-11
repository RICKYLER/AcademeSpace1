import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWvkHHdr7JnnTXnipT9yfQq63mlh32Q-c",
  authDomain: "chat-62000.firebaseapp.com",
  projectId: "chat-62000",
  storageBucket: "chat-62000.firebasestorage.app",
  messagingSenderId: "493553457166",
  appId: "1:493553457166:web:9af993df11a5fbe87b045f",
  measurementId: "G-3J2GC1ZC42"
};

// Initialize Firebase (check if app already exists)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // App already exists, get the existing one
  app = getApp();
}

const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Firestore collections
export const collections = {
  messages: 'messages',
  conversations: 'conversations',
  users: 'users',
  typing: 'typing'
};

// Initialize anonymous auth
export const initializeAuth = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
};

// Message functions
export const addMessage = async (messageData: {
  conversationId: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp?: any;
  isMe?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  fileData?: any;
}) => {
  try {
    const docRef = await addDoc(collection(db, collections.messages), {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

// Listen to messages for a conversation
export const listenToMessages = (conversationId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, collections.messages),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.conversationId === conversationId) {
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      }
    });
    callback(messages);
  });
};

// Conversation functions
export const addConversation = async (conversationData: {
  name: string;
  participants: string[];
  lastMessage?: string;
  timestamp?: any;
  unread?: number;
  avatar?: string;
  isOnline?: boolean;
}) => {
  try {
    const docRef = await addDoc(collection(db, collections.conversations), {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error adding conversation:', error);
    throw error;
  }
};

// User functions
export const addUser = async (userData: {
  userId: string;
  username: string;
  isOnline: boolean;
  lastSeen?: any;
}) => {
  try {
    const docRef = await addDoc(collection(db, collections.users), {
      ...userData,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Typing indicator functions
export const setTypingStatus = async (typingData: {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}) => {
  try {
    const docRef = await addDoc(collection(db, collections.typing), {
      ...typingData,
      timestamp: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error setting typing status:', error);
    throw error;
  }
};

export { app, analytics, db, auth }; 