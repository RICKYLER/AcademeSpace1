import React, { useState, useEffect } from 'react';
import useFirebaseChat from '../hooks/useFirebaseChat';

const FirebaseRealtimeDemo: React.FC = () => {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [conversationId, setConversationId] = useState('demo-conversation');
  
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

  // Auto-generate user info on mount
  useEffect(() => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const randomName = `User_${Math.floor(Math.random() * 1000)}`;
    
    setUserId(randomId);
    setUsername(randomName);
    
    // Set user online
    setUserOnline(randomId, randomName);
    
    // Join the demo conversation
    joinConversation(conversationId);
  }, [conversationId, setUserOnline, joinConversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !username || !userId) return;
    
    await sendMessage(conversationId, message, username, userId);
    setMessage('');
  };

  const handleTypingStart = () => {
    sendTypingStart(conversationId, username, userId);
  };

  const handleTypingStop = () => {
    sendTypingStop(conversationId, username, userId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Firebase Realtime Chat Demo
        </h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          <span>•</span>
          <span>User: {username}</span>
          <span>•</span>
          <span>Conversation: {conversationId}</span>
        </div>
      </div>

      {/* Messages Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 h-96 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === username
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">{msg.sender}</div>
                  <div>{msg.content}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                <div className="text-xs opacity-75 mb-1">
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
        </div>
      </div>

      {/* Message Input */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Your user ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            onFocus={handleTypingStart}
            onBlur={handleTypingStop}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => joinConversation(conversationId)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Join Conversation
          </button>
          <button
            onClick={() => leaveConversation(conversationId)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Leave Conversation
          </button>
          <button
            onClick={() => setUserOnline(userId, username)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Set Online
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <div className="text-sm space-y-1">
          <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
          <div>Messages Count: {messages.length}</div>
          <div>Typing Users: {typingUsers.length}</div>
          <div>Current User: {username} ({userId})</div>
          <div>Conversation ID: {conversationId}</div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseRealtimeDemo; 