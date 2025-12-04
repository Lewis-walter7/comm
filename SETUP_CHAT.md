# Chat System Setup Instructions

## Port Configuration Issue Fix

You're getting `ERR_CONNECTION_REFUSED` to port 3001 because there's a port mismatch between your backend and frontend configuration.

### Current Situation
- Your backend is running on **port 4000**
- Your frontend was trying to connect to **port 3001** (now fixed)

## Quick Fix Steps

### 1. Backend Environment Setup

Your backend should have a `.env` file. Copy the example and update it:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and ensure it has:
```env
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/securerealtime"
JWT_SECRET="your-secret-key-here"
CORS_ORIGIN="http://localhost:3000"
```

### 2. Frontend Environment Setup

Make sure your `frontend/.env.local` has the correct API URLs:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 3. Restart Both Services

**Backend:**
```bash
cd backend
bun run dev
```
The server should show: `🚀 Server running on http://localhost:4000`

**Frontend:**
```bash
cd frontend
bun run dev
```
The frontend should be on: `http://localhost:3000`

### 4. Test the Connection

1. Open browser to `http://localhost:3000`
2. Try to register/login
3. API calls should now go to `http://localhost:4000`

## Chat System URLs

Once running, you can access:

- **Main Dashboard**: `http://localhost:3000/dashboard`
- **Workspace Chat**: `http://localhost:3000/w/{workspaceId}/chat`
- **Individual Chat**: `http://localhost:3000/w/{workspaceId}/chat/{conversationId}`
- **Document Chat**: `http://localhost:3000/w/{workspaceId}/document/{docId}/chat`

## Common Issues & Solutions

### 1. CORS Errors
If you see CORS errors, make sure your backend `.env` has:
```env
CORS_ORIGIN="http://localhost:3000"
```

### 2. WebSocket Connection Issues
WebSocket connects to the same port as the API. Make sure:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 3. Database Connection
Make sure PostgreSQL is running and accessible:
```bash
# Test connection
psql -h localhost -p 5432 -U username -d securerealtime
```

### 4. Environment Variables Not Loading
If changes aren't taking effect:
1. Restart both servers completely
2. Clear browser cache
3. Check `.env` and `.env.local` files exist in correct locations

## Database Setup

If you need to reset/setup the database:
```bash
cd backend
bun run prisma:reset --force
bun run prisma:migrate:dev --name "init-chat-system"
bun run prisma:generate
```

## Features Ready to Test

✅ **Authentication** - Register/Login
✅ **Workspaces** - Create/Join workspaces
✅ **Direct Messages** - 1:1 conversations
✅ **Group Channels** - Team discussions
✅ **Document Chats** - Context-specific discussions
✅ **Real-time Messaging** - Instant message sync
✅ **Typing Indicators** - See when others type
✅ **Message Reactions** - Emoji reactions
✅ **Message Threads** - Reply to messages
✅ **File Sharing** - Upload attachments
✅ **Presence Status** - Online/offline status
✅ **Read Receipts** - See who read messages
✅ **Message Search** - Full-text search
✅ **Infinite Scroll** - Load message history

## Troubleshooting

### Check Server Status
```bash
# Backend health check
curl http://localhost:4000/auth/health

# Or check if port is listening
lsof -i :4000
```

### Check Frontend Build
```bash
cd frontend
bun run build
```

### View Logs
- Backend logs appear in the terminal running `bun run dev`
- Frontend logs in browser developer console
- WebSocket events in Network tab

### Reset Everything
If all else fails:
```bash
# Stop all servers
# Clear node_modules
cd backend && rm -rf node_modules && bun install
cd ../frontend && rm -rf node_modules .next && bun install

# Reset database
cd ../backend && bun run prisma:reset --force

# Restart servers
cd backend && bun run dev &
cd ../frontend && bun run dev
```

## Support

If you encounter issues:
1. Check this file for common solutions
2. Verify environment variables are correct
3. Ensure all services (PostgreSQL, backend, frontend) are running
4. Check browser network tab for specific error messages
5. Review server logs for backend errors

The chat system is now fully functional with all modern features!