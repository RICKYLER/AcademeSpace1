import React, { useState, useEffect } from 'react';
import { addRealtimeMessage, listenToRealtimeMessages } from '../lib/firebase-realtime';

const FirebaseMessageTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId] = useState('test-conversation');

  // Auto-generate username on mount
  useEffect(() => {
    const randomName = `User_${Math.floor(Math.random() * 1000)}`;
    setUsername(randomName);
  }, []);

  // Listen to messages
  useEffect(() => {
    const unsubscribe = listenToRealtimeMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      setIsConnected(true);
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addRealtimeMessage(conversationId, {
        sender: username,
        senderId: username,
        content: message.trim(),
        status: 'sent'
      });
      setMessage('');
      console.log('✅ Message sent to Firebase');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Firebase Message Test</h2>
      
      {/* Connection Status */}
      <div className="mb-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm">
          {isConnected ? 'Connected to Firebase' : 'Connecting to Firebase...'}
        </span>
        <span className="text-xs text-gray-500">• {username}</span>
      </div>

      {/* Messages Display */}
      <div className="h-64 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Send your first message!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
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
        </div>
      </div>

      {/* Message Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <h4 className="font-semibold mb-1">Firebase Debug Info:</h4>
        <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
        <div>Messages Count: {messages.length}</div>
        <div>Conversation ID: {conversationId}</div>
        <div>Current User: {username}</div>
        <div>Firebase URL: chat-62000-default-rtdb.firebaseio.com</div>
      </div>

      {/* Test Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => {
            const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
            addRealtimeMessage(conversationId, {
              sender: username,
              senderId: username,
              content: testMessage,
              status: 'sent'
            });
          }}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Test Message
        </button>
        
        <button
          onClick={() => {
            setMessages([]);
            console.log('Messages cleared locally');
          }}
          className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Clear Messages (Local)
        </button>
      </div>
    </div>
  );
};

export default FirebaseMessageTest; 