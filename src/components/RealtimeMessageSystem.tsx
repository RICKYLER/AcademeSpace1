import React, { useState, useEffect, useRef } from 'react';
import useFirebaseChat from '../hooks/useFirebaseChat';

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

const RealtimeMessageSystem: React.FC = () => {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [conversationId, setConversationId] = useState('main-chat');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    setUserOnline,
    joinConversation,
    leaveConversation
  } = useFirebaseChat();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-generate user info and join conversation
  useEffect(() => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const randomName = `User_${Math.floor(Math.random() * 1000)}`;
    
    setUserId(randomId);
    setUsername(randomName);
    
    // Set user online and join conversation
    setUserOnline(randomId, randomName);
    joinConversation(conversationId);
  }, [conversationId, setUserOnline, joinConversation]);

  // Typing indicator with debounce
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    if (isTyping) {
      sendTypingStart(conversationId, username, userId);
      
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        sendTypingStop(conversationId, username, userId);
      }, 2000); // Stop typing indicator after 2 seconds
    } else {
      sendTypingStop(conversationId, username, userId);
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [isTyping, conversationId, username, userId, sendTypingStart, sendTypingStop]);

  const handleSendMessage = async () => {
    if (!message.trim() || !username || !userId) return;
    
    setIsTyping(false);
    await sendMessage(conversationId, message, username, userId);
    setMessage('');
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = (status?: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Real-Time Chat</h1>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span>{username}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Active Users: {typingUsers.length + 1}</div>
            <div className="text-xs opacity-75">Conversation: {conversationId}</div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <div className="text-lg font-medium">Welcome to the chat!</div>
              <div className="text-sm">Start typing to send your first message</div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-xs lg:max-w-md">
                  {msg.sender !== username && (
                    <div className="text-xs text-gray-500 mb-1 ml-2">{msg.sender}</div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg shadow-sm ${
                      msg.sender === username
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="break-words">{msg.content}</div>
                    <div className={`text-xs mt-1 flex items-center justify-between ${
                      msg.sender === username ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.sender === username && (
                        <span className="ml-2">{getMessageStatus(msg.status)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicators */}
          {typingUsers.filter(user => user !== username).length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 mb-1">
                  {typingUsers.filter(user => user !== username).join(', ')} is typing...
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isConnected}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Status: {isConnected ? 'Connected' : 'Connecting...'}</span>
            {isTyping && <span>• Typing...</span>}
          </div>
          <div className="flex items-center space-x-4">
            <span>Messages: {messages.length}</span>
            <span>Users: {typingUsers.length + 1}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setUserOnline(userId, username)}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Set Online
          </button>
          <button
            onClick={() => joinConversation(conversationId)}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Rejoin Chat
          </button>
          <button
            onClick={() => leaveConversation(conversationId)}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Leave Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMessageSystem; 