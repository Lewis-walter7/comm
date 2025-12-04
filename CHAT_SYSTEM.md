# SecureRealTime Chat System

A complete real-time chat system built with workspace-based organization, supporting direct messages, group channels, document discussions, and advanced features like threads, reactions, file sharing, and optional end-to-end encryption.

## 🚀 Features

### Core Chat Types
- **Direct Messages (DMs)**: 1:1 private conversations with optional E2E encryption
- **Group Channels**: Workspace-level discussions with role-based permissions
- **Document Chats**: Context-specific discussions attached to documents

### Real-time Features
- **Instant Message Sync**: WebSocket-based real-time messaging
- **Typing Indicators**: See when others are typing
- **Presence Status**: Online/away/busy/offline status
- **Live Read Receipts**: See who has read your messages
- **Thread Support**: Reply to messages in organized threads
- **Reactions**: React to messages with emojis
- **File Sharing**: Upload and share files with encryption

### Security & Encryption
- **End-to-End Encryption**: Optional for DMs using Diffie-Hellman key exchange
- **Encryption at Rest**: Group chats encrypted with workspace keys
- **File Encryption**: Uploaded files encrypted per-file
- **Workspace Isolation**: All chats scoped to specific workspaces

### Advanced Features
- **Message Editing & Deletion**: Edit or delete your own messages
- **Infinite Scroll**: Lazy loading of message history
- **Search**: Full-text search across conversations
- **Unread Counters**: Track unread messages per conversation
- **Member Management**: Add/remove members, manage roles

## 🏗️ Architecture

### Backend (NestJS + Socket.IO)
```
backend/src/chat/
├── chat.controller.ts    # REST API endpoints
├── chat.gateway.ts       # WebSocket gateway for real-time features
├── chat.service.ts       # Business logic and database operations
├── chat.module.ts        # Module configuration
└── dto/
    └── chat.dto.ts       # Data transfer objects and validation
```

### Frontend (Next.js + React)
```
frontend/
├── app/w/[workspaceId]/chat/                    # Workspace chat routes
│   ├── page.tsx                                 # Main chat page
│   ├── [conversationId]/page.tsx               # Individual conversation
│   └── layout.tsx                              # Chat layout with provider
├── app/w/[workspaceId]/document/[docId]/chat/  # Document chat
│   └── page.tsx                                # Document-specific chat
├── components/chat/                             # Chat components
│   ├── ChatSidebar.tsx                         # Conversations list
│   ├── ChatWindow.tsx                          # Main chat interface
│   └── ThreadPanel.tsx                         # Thread discussions
├── context/chat/                                # State management
│   └── ChatContext.tsx                         # React context for chat state
└── services/chat/                               # API services
    ├── chatApi.ts                              # HTTP API client
    └── socketService.ts                        # WebSocket client
```

### Database Schema (Prisma)
```sql
-- Core conversation model
Conversation {
  id          String           @id @default(uuid())
  workspaceId String
  type        ConversationType  // DM, GROUP, DOCUMENT
  name        String?
  description String?
  icon        String?
  createdById String
  documentId  String?          // For document chats
  isEncrypted Boolean         // E2E encryption flag
  encryptionKey String?       // Encrypted with workspace key
  createdAt   DateTime
  updatedAt   DateTime
}

-- Conversation membership
ConversationMember {
  id             String           @id
  conversationId String
  userId         String
  role           ConversationRole // ADMIN, MEMBER
  joinedAt       DateTime
  lastReadAt     DateTime?
}

-- Messages with threading support
Message {
  id             String    @id @default(uuid())
  conversationId String
  userId         String
  content        String    // Encrypted or plain based on conversation
  attachments    Json?     // Array of attachment objects
  replyToId      String?   // For threading
  editedAt       DateTime?
  deletedAt      DateTime?
  reactions      Json?     // {emoji: [userIds]}
  createdAt      DateTime
}

-- Read receipts for messages
MessageReadReceipt {
  id             String   @id
  messageId      String
  conversationId String
  userId         String
  readAt         DateTime
}

-- User presence per workspace
PresenceStatus {
  id          String   @id
  userId      String
  workspaceId String
  status      String   // online, away, busy, offline
  lastSeen    DateTime
  updatedAt   DateTime
}
```

## 🚦 API Endpoints

### REST API
```typescript
// Conversation Management
POST   /chat/conversations                    // Create conversation
GET    /chat/conversations                    // List conversations
GET    /chat/conversations/:id               // Get conversation details
PUT    /chat/conversations/:id               // Update conversation
DELETE /chat/conversations/:id               // Delete conversation

// Message Management
POST   /chat/conversations/:id/messages      // Send message
GET    /chat/conversations/:id/messages      // Get messages
PUT    /chat/messages/:id                    // Edit message
DELETE /chat/messages/:id                    // Delete message
POST   /chat/messages/:id/reactions          // Add/remove reaction

// Member Management
POST   /chat/conversations/:id/members       // Add member
DELETE /chat/conversations/:id/members/:uid  // Remove member
PUT    /chat/conversations/:id/members/:uid/role // Update member role
POST   /chat/conversations/:id/read          // Mark as read

// Presence & Utility
PUT    /chat/presence                        // Update presence status
GET    /chat/presence/:workspaceId           // Get workspace presence
GET    /chat/search                          // Search messages
GET    /chat/workspaces/:id/unread-count     // Get unread counts
```

### WebSocket Events
```typescript
// Connection & Room Management
emit('join_workspace', { workspaceId })       // Join workspace room
emit('join_conversation', { conversationId }) // Join conversation room
emit('leave_conversation', { conversationId }) // Leave conversation room

// Real-time Messaging
emit('send_message', { conversationId, content, replyToId? })
emit('edit_message', { messageId, content })
emit('delete_message', { messageId, conversationId })
emit('add_reaction', { messageId, emoji, conversationId })

// Typing Indicators
emit('typing_start', { conversationId })
emit('typing_stop', { conversationId })

// Read Receipts & Presence
emit('mark_as_read', { conversationId, messageId? })
emit('update_presence', { status, workspaceId })

// Incoming Events
on('message:new', { message, conversationId })
on('message:edit', { message })
on('message:delete', { messageId, conversationId })
on('message:reaction', { message })
on('message:read', { userId, conversationId, messageId?, readAt })
on('typing:start', { userId, conversationId })
on('typing:stop', { userId, conversationId })
on('conversation:new', { conversation })
on('conversation:updated', { conversationId, updates })
on('presence_update', { userId, status, workspaceId, lastSeen })
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ or Bun 1.0+
- PostgreSQL 14+
- Redis (optional, for enhanced real-time features)

### Backend Setup
```bash
cd backend

# Install dependencies
bun install

# Setup database
bun run prisma:migrate:dev
bun run prisma:generate

# Start development server
bun run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies  
bun install

# Start development server
bun run dev
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/securerealtime"
JWT_SECRET="your-jwt-secret"
REDIS_URL="redis://localhost:6379" # Optional

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_ENABLE_E2E_ENCRYPTION="true"
```

## 📱 Usage

### Routing Structure
All chat routes are workspace-based:
```
/w/[workspaceId]/chat                     # Main chat interface
/w/[workspaceId]/chat/[conversationId]    # Individual conversation
/w/[workspaceId]/document/[docId]/chat    # Document-specific chat
```

### Creating Conversations
```typescript
// Create a group channel
await createConversation({
  type: 'GROUP',
  name: 'general',
  description: 'General team discussion',
  workspaceId: 'workspace-id',
  memberIds: ['user1', 'user2']
});

// Create a DM
await createConversation({
  type: 'DM',
  workspaceId: 'workspace-id',
  memberIds: ['other-user-id'],
  isEncrypted: true // Optional E2E encryption
});

// Create document chat
await createConversation({
  type: 'DOCUMENT',
  name: 'Project Spec Discussion',
  workspaceId: 'workspace-id',
  documentId: 'doc-id'
});
```

### Real-time Integration
The chat system uses React Context for state management and automatically handles:
- WebSocket connection management
- Message synchronization
- Typing indicators
- Presence updates
- Reconnection logic

## 🔒 Security Features

### End-to-End Encryption (DMs)
- Uses Diffie-Hellman key exchange
- Messages encrypted client-side
- Server cannot decrypt content
- Keys never stored in plain text

### Workspace Isolation
- All conversations scoped to workspaces
- Permission checks on every operation
- Member-based access control
- Role-based conversation management

### Data Protection
- File encryption with per-file keys
- Secure file upload handling
- Message deletion (soft delete)
- Audit trail for all actions

## 🚀 Performance Features

### Optimizations
- **Infinite Scroll**: Lazy load message history
- **Connection Pooling**: Efficient database connections  
- **Caching**: Redis caching for presence and frequent queries
- **Compression**: Message payload compression
- **Debounced Typing**: Reduced typing indicator spam

### Scalability
- **Horizontal Scaling**: Stateless WebSocket design
- **Database Indexing**: Optimized queries with proper indexes
- **CDN Support**: File uploads to cloud storage
- **Rate Limiting**: API and WebSocket rate limiting

## 🧪 Testing

### Backend Tests
```bash
cd backend
bun test
```

### Frontend Tests  
```bash
cd frontend
bun test
```

### Integration Tests
The system includes comprehensive tests for:
- WebSocket message flow
- Database operations  
- Authentication/authorization
- File upload/encryption
- Real-time synchronization

## 📈 Monitoring

### Metrics Tracked
- Message volume per workspace
- Active users and presence
- File upload statistics
- WebSocket connection health
- API response times

### Logging
- Structured logging with correlation IDs
- Error tracking and alerting
- Performance monitoring
- Security audit logs

## 🔄 Future Enhancements

### Planned Features
- **Voice/Video Chat**: WebRTC integration
- **Screen Sharing**: Real-time screen collaboration  
- **AI Integration**: Smart replies and summarization
- **Advanced Search**: Semantic search with embeddings
- **Mobile Apps**: React Native mobile clients
- **Integrations**: Slack, Discord, Teams bridges

### Extensibility
The system is designed for easy extension:
- Plugin architecture for custom features
- Webhook system for external integrations
- Custom themes and branding
- Advanced permission systems

## 📞 Support

For issues, questions, or contributions:
- Create issues in the project repository
- Check the troubleshooting guide
- Review the API documentation
- Join the developer community

## 📄 License

This chat system is part of the SecureRealTime collaboration platform.