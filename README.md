# SecureRealTime Collaboration Platform

A secure, real-time collaboration platform for teams to work together on documents, chat, and projects with end-to-end encryption.

## Overview

SecureRealTime enables live collaboration, secure communication, and organized project management in one place. Designed for remote teams, freelancers, and small-to-medium businesses.

## Features

- 🔐 **End-to-End Encryption** - All documents and messages encrypted client-side
- ⚡ **Real-Time Collaboration** - Live document editing with multi-user cursors
- 💬 **Secure Chat** - Project-based messaging with E2EE
- 👥 **Team Management** - Role-based access control (Owner, Editor, Viewer)
- 📁 **File Attachments** - Secure storage for project assets
- 🔄 **Offline Sync** - Edit offline, sync when reconnected

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** ≥ 1.0 ([Install Bun](https://bun.sh))
- **PostgreSQL** ≥ 14
- **Redis** ≥ 6

### Installing PostgreSQL on Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a database
sudo -u postgres psql
CREATE DATABASE securerealtime;
CREATE USER securerealtime_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE securerealtime TO securerealtime_user;
\q
```

### Installing Redis on Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd SecureRealTime
```

### 2. Set up environment variables

```bash
# Copy example env files
cp .env.example .env

# Edit .env and configure:
# - DATABASE_URL (PostgreSQL connection string)
# - REDIS_URL (Redis connection string)
# - JWT_SECRET (generate a random secret)
# - Other required variables
```

### 3. Install dependencies and set up database

```bash
# Backend
cd backend
bun install
bun run prisma:generate
bun run prisma:migrate

# Frontend
cd ../frontend
bun install
```

### 4. Run the application

```bash
# Terminal 1 - Backend
cd backend
bun run dev

# Terminal 2 - Frontend
cd frontend
bun run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Project Structure

```
SecureRealTime/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── projects/          # Project management
│   │   ├── documents/         # Document collaboration
│   │   ├── chat/              # Real-time chat
│   │   ├── encryption/        # Encryption utilities
│   │   └── database/          # Prisma setup
│   └── prisma/                # Database schema
│
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # React components
│   │   ├── context/           # React context providers
│   │   ├── services/          # API & WebSocket services
│   │   └── utils/             # Helper functions
│   └── public/                # Static assets
│
└── admin-dashboard/            # Electron admin app (future)
```

## Tech Stack

- **Runtime**: Bun
- **Backend**: NestJS, Prisma, Socket.IO, tweetnacl
- **Frontend**: Next.js, React, TipTap, Yjs, Socket.IO Client
- **Database**: PostgreSQL
- **Cache/PubSub**: Redis
- **Encryption**: tweetnacl (E2EE)

## Development Workflow

### Database Migrations

```bash
cd backend

# Create a new migration
bun run prisma:migrate:dev --name migration_name

# Apply migrations
bun run prisma:migrate

# Reset database (CAUTION: deletes all data)
bun run prisma:reset
```

### Running Tests

```bash
# Backend tests
cd backend
bun test

# Frontend tests
cd frontend
bun test
```

## Security

- All sensitive data is encrypted **client-side** before being sent to the server
- Server stores only encrypted content
- Role-based access control ensures users see only what they're permitted to
- JWT authentication with refresh tokens
- HTTPS required in production

## Roadmap

### Phase 1 (MVP) ✅
- ✅ Authentication & user management
- ✅ Project creation and management
- ✅ Real-time document collaboration
- ✅ Secure chat system

### Phase 2 (Beta)
- [ ] Two-factor authentication (2FA)
- [ ] Enhanced notifications
- [ ] Activity tracking and analytics

### Phase 3 (Monetization)
- [ ] Advanced file management
- [ ] Task/To-Do system
- [ ] Subscription plans

### Phase 4 (Scale)
- [ ] Admin dashboard (Electron)
- [ ] Third-party integrations
- [ ] Mobile apps

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

[Your chosen license]

## Support

For issues and questions, please open an issue on GitHub or contact [your-email].
