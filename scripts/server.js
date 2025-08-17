import express from 'express';
import cors from 'cors';
// Using native fetch (Node.js 18+)
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWvkHHdr7JnnTXnipT9yfQq63mlh32Q-c",
  authDomain: "chat-62000.firebaseapp.com",
  projectId: "chat-62000",
  storageBucket: "chat-62000.firebasestorage.app",
  messagingSenderId: "493553457166",
  appId: "1:493553457166:web:9af993df11a5fbe87b045f",
  measurementId: "G-3J2GC1ZC42"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Firestore collections
const collections = {
  messages: 'messages',
  conversations: 'conversations',
  users: 'users',
  typing: 'typing'
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8081"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// In-memory storage for messages, users, and feed posts (in production, use a database)
const conversations = new Map();
const onlineUsers = new Map();
const feedPosts = [];

// Firebase helper functions
const saveMessageToFirebase = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, collections.messages), {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error saving message to Firebase:', error);
    throw error;
  }
};

const saveUserToFirebase = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, collections.users), {
      ...userData,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error saving user to Firebase:', error);
    throw error;
  }
};

const saveTypingStatusToFirebase = async (typingData) => {
  try {
    const docRef = await addDoc(collection(db, collections.typing), {
      ...typingData,
      timestamp: serverTimestamp()
    });
    return docRef;
  } catch (error) {
    console.error('Error saving typing status to Firebase:', error);
    throw error;
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a conversation
  socket.on('join_conversation', async (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
    
    // Get messages from Firebase for this conversation
    try {
      const q = query(
        collection(db, collections.messages),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
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
        socket.emit('load_messages', messages);
      });
      
      // Store unsubscribe function for cleanup
      socket.data = { ...socket.data, unsubscribe };
    } catch (error) {
      console.error('Error loading messages from Firebase:', error);
      // Fallback to in-memory storage
      const messages = conversations.get(conversationId) || [];
      socket.emit('load_messages', messages);
    }
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    const { conversationId, message, sender, senderId } = data;
    
    const newMessage = {
      id: Date.now().toString(),
      sender,
      senderId,
      content: message,
      timestamp: new Date().toISOString(),
      isMe: false,
      status: 'sent'
    };

    try {
      // Save message to Firebase
      await saveMessageToFirebase({
        conversationId,
        sender,
        senderId,
        content: message,
        status: 'sent'
      });
      
      console.log(`Message saved to Firebase for conversation ${conversationId}`);
    } catch (error) {
      console.error('Error saving message to Firebase:', error);
      // Fallback to in-memory storage
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
      }
      conversations.get(conversationId).push(newMessage);
    }

    // Broadcast to all users in the conversation
    io.to(conversationId).emit('new_message', newMessage);
    
    console.log(`Message sent in conversation ${conversationId}:`, newMessage);
  });

  // Handle feed: create new post (broadcast to all)
  socket.on('create_post', (postData) => {
    try {
      const post = {
        id: postData?.id || Date.now(),
        author: postData?.author || 'Unknown',
        avatar: postData?.avatar || '📝',
        time: postData?.time || 'now',
        content: postData?.content || '',
        likes: postData?.likes ?? 0,
        comments: Array.isArray(postData?.comments) ? postData.comments : [],
        shares: postData?.shares ?? 0,
        type: postData?.type || 'post',
        isLiked: false,
        attachments: Array.isArray(postData?.attachments) ? postData.attachments : undefined
      };
      feedPosts.unshift(post);
      io.emit('new_post', post);
      console.log('Broadcast new_post', post.id);
    } catch (err) {
      console.error('Error handling create_post:', err);
    }
  });

  // Handle typing indicator
  socket.on('typing_start', async (data) => {
    const { conversationId, sender } = data;
    
    try {
      // Save typing status to Firebase
      await saveTypingStatusToFirebase({
        conversationId,
        userId: socket.id,
        username: sender,
        isTyping: true
      });
    } catch (error) {
      console.error('Error saving typing status to Firebase:', error);
    }
    
    socket.to(conversationId).emit('user_typing', { sender, isTyping: true });
  });

  socket.on('typing_stop', async (data) => {
    const { conversationId, sender } = data;
    
    try {
      // Save typing status to Firebase
      await saveTypingStatusToFirebase({
        conversationId,
        userId: socket.id,
        username: sender,
        isTyping: false
      });
    } catch (error) {
      console.error('Error saving typing status to Firebase:', error);
    }
    
    socket.to(conversationId).emit('user_typing', { sender, isTyping: false });
  });

  // Handle user online status
  socket.on('user_online', async (data) => {
    const { userId, username } = data;
    onlineUsers.set(userId, { socketId: socket.id, username, lastSeen: new Date() });
    
    try {
      // Save user status to Firebase
      await saveUserToFirebase({
        userId,
        username,
        isOnline: true,
        socketId: socket.id
      });
      console.log(`User ${username} online status saved to Firebase`);
    } catch (error) {
      console.error('Error saving user status to Firebase:', error);
    }
    
    io.emit('user_status_change', { userId, status: 'online', username });
  });

  // Handle read receipts
  socket.on('mark_read', (data) => {
    const { conversationId, messageIds } = data;
    io.to(conversationId).emit('messages_read', { messageIds });
  });

  // Handle file sharing
  socket.on('share_file', (data) => {
    const { conversationId, fileData, sender, senderId } = data;
    
    const fileMessage = {
      id: Date.now().toString(),
      sender,
      senderId,
      content: `Shared a file: ${fileData.name}`,
      timestamp: new Date().toISOString(),
      isMe: false,
      status: 'sent',
      fileData
    };

    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    conversations.get(conversationId).push(fileMessage);

    io.to(conversationId).emit('new_message', fileMessage);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Clean up Firebase listeners
    if (socket.data?.unsubscribe) {
      socket.data.unsubscribe();
    }
    
    // Remove user from online users
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        onlineUsers.delete(userId);
        
        try {
          // Update user status in Firebase
          await saveUserToFirebase({
            userId,
            username: userData.username,
            isOnline: false,
            socketId: null
          });
          console.log(`User ${userData.username} offline status saved to Firebase`);
        } catch (error) {
          console.error('Error saving offline status to Firebase:', error);
        }
        
        io.emit('user_status_change', { userId, status: 'offline' });
        break;
      }
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// AI Image Generation API endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size, style, apiProvider = 'openai' } = req.body;
    const apiToken = req.headers.authorization?.replace('Bearer ', '');

    // Only require token for providers that don't have environment variables configured
    if (!apiToken && apiProvider !== 'venice') {
      return res.status(401).json({ error: 'API token is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let imageUrl;
    
    // Support for different AI providers
    switch (apiProvider) {
      case 'openai':
        imageUrl = await generateWithOpenAI(prompt, size, style, apiToken);
        break;
      case 'stability':
        imageUrl = await generateWithStability(prompt, size, style, apiToken);
        break;
      case 'venice':
        imageUrl = await generateWithVenice(prompt, size, style, apiToken);
        break;
      case 'midjourney':
        imageUrl = await generateWithMidjourney(prompt, size, style, apiToken);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported API provider' });
    }

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Venice AI Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, messages, model = 'default', max_tokens = 1000, temperature = 0.7, stream = false } = req.body;
    const apiToken = req.headers.authorization?.replace('Bearer ', '') || process.env.VITE_VENICE_CHAT_API_KEY;

    if (!apiToken) {
      return res.status(401).json({ error: 'API token is required. Please set VITE_VENICE_CHAT_API_KEY in your .env file.' });
    }

    // Support both simple message and complex messages array
    let requestMessages;
    if (messages) {
      requestMessages = messages;
    } else if (message) {
      requestMessages = [{ role: 'user', content: message }];
    } else {
      return res.status(400).json({ error: 'Message or messages array is required' });
    }

    const requestBody = {
      model: model,
      messages: requestMessages,
      max_tokens: max_tokens,
      temperature: temperature
    };

    if (stream) {
      requestBody.stream = true;
    }

    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: `Venice Chat API error: ${error}` });
    }

    if (stream) {
      // Forward streaming response
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Using native fetch for streaming responses
      if (!response.body) {
        return res.status(500).json({ error: 'Failed to read streaming response' });
      }

      // Pipe the response body directly to the client
      response.body.pipe(res);
      
      response.body.on('end', () => {
        res.end();
      });
      
      response.body.on('error', (error) => {
        console.error('Streaming error:', error);
        res.end();
      })
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to get chat response' });
  }
});

// Chat API endpoints
app.get('/api/conversations', (req, res) => {
  // Return list of conversations (in production, fetch from database)
  const conversationList = [
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
  
  res.json(conversationList);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const conversationId = req.params.id;
  const messages = conversations.get(conversationId) || [];
  res.json(messages);
});

app.get('/api/online-users', (req, res) => {
  const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, userData]) => ({
    userId,
    username: userData.username,
    lastSeen: userData.lastSeen
  }));
  res.json(onlineUsersList);
});

// OpenAI DALL-E API
async function generateWithOpenAI(prompt, size, style, apiToken) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size,
      style: style === 'vivid' ? 'vivid' : 'natural',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

// Stability AI API
async function generateWithStability(prompt, size, style, apiToken) {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      text_prompts: [
        {
          text: prompt,
          weight: 1,
        },
      ],
      cfg_scale: 7,
      height: parseInt(size.split('x')[1]),
      width: parseInt(size.split('x')[0]),
      samples: 1,
      steps: 30,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stability AI API error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// Venice AI API
async function generateWithVenice(prompt, size, style, apiToken) {
  // Parse size to get width and height
  const [width, height] = size.split('x').map(Number);
  
  // Use environment variable if no token provided
  const token = apiToken || process.env.VITE_VENICE_IMAGE_API_KEY;
  
  if (!token) {
    throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your .env file.');
  }
  
  const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      negative_prompt: '',
      width: width,
      height: height,
      steps: 20,
      cfg_scale: 7.5,
      model: 'hidream',
      format: 'webp',
      return_binary: false,
      embed_exif_metadata: false,
      hide_watermark: false,
      safe_mode: false,
      seed: Math.floor(Math.random() * 1000000000),
              style_preset: style === 'vivid' ? '3D Model' : 'Photographic',
        lora_strength: 50
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Venice AI API error: ${error.error?.message || error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Venice AI returns base64 encoded images in the images array
  if (data.images && data.images.length > 0) {
    return `data:image/webp;base64,${data.images[0]}`;
  }
  
  throw new Error('No image generated from Venice AI');
}

// Midjourney API (placeholder - you'll need to implement based on your Midjourney API)
async function generateWithMidjourney(prompt, size, style, apiToken) {
  // This is a placeholder implementation
  // You'll need to implement based on your specific Midjourney API
  throw new Error('Midjourney API not implemented yet');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});