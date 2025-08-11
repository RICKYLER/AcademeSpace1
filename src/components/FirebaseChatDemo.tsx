import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Database, Wifi, WifiOff, MessageSquare, Users } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { addMessage, listenToMessages } from '../lib/firebase';

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const FirebaseChatDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser] = useState({ id: 'demo-user', name: 'Demo User' });
  const [firebaseMessages, setFirebaseMessages] = useState<Message[]>([]);
  const [showFirebaseData, setShowFirebaseData] = useState(false);

  const {
    socket,
    isConnected,
    sendMessage,
    setUserOnline
  } = useSocket();

  // Initialize user online status
  useEffect(() => {
    if (isConnected) {
      setUserOnline(currentUser.id, currentUser.name);
    }
  }, [isConnected, currentUser.id, currentUser.name, setUserOnline]);

  // Listen to Firebase messages
  useEffect(() => {
    const unsubscribe = listenToMessages('demo-conversation', (messages) => {
      setFirebaseMessages(messages.map(msg => ({
        ...msg,
        isMe: msg.senderId === currentUser.id
      })));
    });

    return () => unsubscribe();
  }, [currentUser.id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, {
        ...message,
        isMe: message.senderId === currentUser.id
      }]);
    });

    socket.on('load_messages', (loadedMessages: Message[]) => {
      setMessages(loadedMessages.map(msg => ({
        ...msg,
        isMe: msg.senderId === currentUser.id
      })));
    });

    return () => {
      socket.off('new_message');
      socket.off('load_messages');
    };
  }, [socket, currentUser.id]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const messageData = {
        conversationId: 'demo-conversation',
        sender: currentUser.name,
        senderId: currentUser.id,
        content: newMessage.trim()
      };

      try {
        // Send via Socket.IO
        sendMessage('demo-conversation', newMessage.trim(), currentUser.name, currentUser.id);
        
        // Also save to Firebase directly
        await addMessage(messageData);
        
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Firebase + Socket.IO Real-Time Chat Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Experience real-time messaging with persistent data storage using Firebase Firestore
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex justify-center space-x-4">
        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          Socket.IO: {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Firebase: Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Socket.IO Messages */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Socket.IO Messages (Real-time)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet. Start typing to send a message!</p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.isMe
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">{message.sender}</div>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!isConnected}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Messages */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Firebase Messages (Persistent)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
              {firebaseMessages.length === 0 ? (
                <p className="text-gray-500 text-center">No Firebase messages yet. Messages will appear here when sent!</p>
              ) : (
                firebaseMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.isMe
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">{message.sender}</div>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-center">
              <Badge variant="outline" className="flex items-center gap-2 mx-auto">
                <Users className="w-4 h-4" />
                {firebaseMessages.length} messages stored in Firebase
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Chat Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Socket.IO Features</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Real-time message broadcasting</li>
                <li>• Instant message delivery</li>
                <li>• Connection status monitoring</li>
                <li>• Typing indicators</li>
                <li>• User online/offline status</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Firebase Features</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Persistent message storage</li>
                <li>• Real-time data synchronization</li>
                <li>• Offline data access</li>
                <li>• Scalable cloud database</li>
                <li>• Automatic data backup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseChatDemo; 