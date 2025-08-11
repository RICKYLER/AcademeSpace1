# Real-Time Chat Setup Guide

## Overview
This guide explains how to set up and use the real-time chat functionality in your AcademeSpace application.

## Features
- ✅ Real-time messaging using Socket.IO
- ✅ Typing indicators
- ✅ Read receipts
- ✅ File sharing
- ✅ Message forwarding
- ✅ Online/offline status
- ✅ Connection status indicators
- ✅ Message persistence (in-memory, can be extended to database)

## Setup Instructions

### 1. Install Dependencies
The required dependencies are already installed:
- `socket.io` (server)
- `socket.io-client` (client)

### 2. Environment Configuration
Create a `.env` file in your project root and add:
```env
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Start the Server
```bash
# Start the development server with both frontend and backend
npm run dev:full

# Or start them separately:
npm run dev          # Frontend (Vite)
npm run server       # Backend (Express + Socket.IO)
```

### 4. Access the Chat
Navigate to `/messages` in your application to access the real-time chat.

## How It Works

### Server-Side (scripts/server.js)
The server handles:
- WebSocket connections via Socket.IO
- Message broadcasting to conversation participants
- Typing indicators
- Read receipts
- File sharing
- User online/offline status

### Client-Side (src/hooks/useSocket.ts)
The `useSocket` hook provides:
- Socket connection management
- Real-time event handling
- Message sending/receiving
- Typing indicators
- Connection status

### Components
- `MessagesContent.tsx`: Main chat interface with real-time functionality
- `MessagesLayout.tsx`: Layout wrapper
- `Messages.tsx`: Page component

## Real-Time Features

### 1. Instant Messaging
- Messages are sent and received in real-time
- No page refresh required
- Automatic message delivery status

### 2. Typing Indicators
- Shows when someone is typing
- Automatically disappears after 1 second of inactivity
- Real-time updates across all participants

### 3. Read Receipts
- Messages show delivery status (sent → delivered → read)
- Automatic read marking when messages are viewed
- Visual indicators for message status

### 4. File Sharing
- Support for file attachments
- File metadata display
- Real-time file sharing notifications

### 5. Message Forwarding
- Forward messages to other conversations
- Add custom messages to forwarded content
- Real-time delivery to multiple recipients

### 6. Connection Status
- Visual indicators for connection status
- Automatic reconnection handling
- Disabled input when disconnected

## API Endpoints

### GET /api/conversations
Returns list of available conversations.

### GET /api/conversations/:id/messages
Returns messages for a specific conversation.

### GET /api/online-users
Returns list of currently online users.

## Socket Events

### Client to Server
- `join_conversation`: Join a conversation room
- `send_message`: Send a new message
- `typing_start`: Start typing indicator
- `typing_stop`: Stop typing indicator
- `mark_read`: Mark messages as read
- `share_file`: Share a file
- `user_online`: Set user online status

### Server to Client
- `new_message`: Receive a new message
- `load_messages`: Load existing messages
- `user_typing`: Receive typing indicator
- `messages_read`: Receive read receipt updates
- `user_status_change`: User online/offline status

## Usage Examples

### Sending a Message
```typescript
const { sendMessage } = useSocket();
sendMessage('conversation-id', 'Hello world!', 'Your Name', 'user-id');
```

### Joining a Conversation
```typescript
const { joinConversation } = useSocket();
joinConversation('conversation-id');
```

### Handling Typing Indicators
```typescript
const { sendTypingStart, sendTypingStop } = useSocket();
sendTypingStart('conversation-id', 'Your Name');
// Automatically stops after 1 second
```

## Customization

### Adding Database Persistence
Replace the in-memory storage in `server.js`:
```javascript
// Replace Map with database queries
const conversations = new Map(); // → Database table
const onlineUsers = new Map();   // → Database table
```

### Adding Authentication
Add user authentication to socket connections:
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token and set user data
  next();
});
```

### Adding Message Encryption
Implement end-to-end encryption:
```javascript
// Encrypt messages before sending
const encryptedMessage = encrypt(message, recipientPublicKey);
socket.emit('send_message', { encryptedMessage });
```

## Troubleshooting

### Connection Issues
1. Check if server is running on port 3001
2. Verify CORS settings in server.js
3. Check browser console for connection errors
4. Ensure environment variables are set correctly

### Messages Not Sending
1. Check socket connection status
2. Verify conversation ID is correct
3. Check server logs for errors
4. Ensure user is authenticated (if applicable)

### Typing Indicators Not Working
1. Check socket event listeners
2. Verify typing timeout is working
3. Check if other users are receiving events

## Performance Considerations

### For Production
- Use Redis for message persistence
- Implement message pagination
- Add rate limiting for message sending
- Use database for user management
- Implement proper authentication
- Add message encryption
- Use CDN for file uploads

### Scaling
- Use Socket.IO Redis adapter for multiple server instances
- Implement message queuing for high traffic
- Add monitoring and logging
- Use load balancers for WebSocket connections

## Security Best Practices

1. **Authentication**: Implement proper user authentication
2. **Authorization**: Check user permissions for conversations
3. **Input Validation**: Validate all message content
4. **Rate Limiting**: Prevent spam and abuse
5. **Encryption**: Use HTTPS/WSS and message encryption
6. **Sanitization**: Sanitize user input before storage
7. **Audit Logging**: Log all message activities

## Testing

### Manual Testing
1. Open multiple browser tabs
2. Join the same conversation
3. Send messages and verify real-time delivery
4. Test typing indicators
5. Test file sharing
6. Test message forwarding

### Automated Testing
```javascript
// Example test for socket connection
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
  // Test message sending
  socket.emit('send_message', {
    conversationId: 'test',
    message: 'Test message',
    sender: 'Test User',
    senderId: 'test-user'
  });
});
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Check server logs for backend issues
3. Verify all dependencies are installed
4. Ensure environment variables are set correctly
5. Test with a fresh browser session

## Future Enhancements

- [ ] Message reactions
- [ ] Voice messages
- [ ] Video calls integration
- [ ] Message search
- [ ] Message editing/deletion
- [ ] Group chat features
- [ ] Message threading
- [ ] Rich text formatting
- [ ] Message scheduling
- [ ] Push notifications 