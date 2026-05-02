# 🚀 Setup Guide - AI Social Media Agents Platform

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Redis** 7+ (Optional, for job queues) ([Download](https://redis.io/download))
- **Git**
- **Claude API Key** ([Get one](https://console.anthropic.com))

## Quick Start (5 Minutes)

### 1. Clone & Install Dependencies

```bash
cd DoAn_Web1

# Frontend
cd frontend
npm install

# Backend (in another terminal)
cd backend
npm install
```

### 2. Setup Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env with your values:
# - CLAUDE_API_KEY=your_key_here
# - DB_PASSWORD=your_postgres_password
# - JWT_SECRET=pick_a_random_string
```

### 3. Setup Database

```bash
cd backend

# Create database
psql -U postgres -c "CREATE DATABASE doan_web1;"

# Setup tables & schema
npm run db:setup

# (Optional) Seed sample data
npm run db:seed
```

### 4. Run Frontend & Backend

**Terminal 1 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### 5. Test the App

1. Open http://localhost:3000
2. Register: Click login → "Register new account"
3. Create content: Go to Content Creator page
4. Create campaign: Go to Ads Manager page
5. View dashboard: Check Dashboard page

---

## Detailed Setup

### PostgreSQL Setup

**On Linux/Mac:**
```bash
# Start PostgreSQL
brew services start postgresql  # Mac
sudo systemctl start postgresql # Linux

# Create database
psql -U postgres -c "CREATE DATABASE doan_web1;"

# Verify
psql -U postgres -l | grep doan_web1
```

**On Windows:**
- Run PostgreSQL installer
- Create database via pgAdmin or command prompt

### Backend Setup

```bash
cd backend

# 1. Copy environment
cp ../.env.example .env

# 2. Edit .env
# - DB_HOST: localhost (or IP)
# - DB_PORT: 5432
# - DB_NAME: doan_web1
# - DB_USER: postgres
# - DB_PASSWORD: your_password
# - JWT_SECRET: random_string
# - CLAUDE_API_KEY: your_key

# 3. Install & setup
npm install
npm run db:setup

# 4. Start server
npm run dev
# Should see: "Server running on port 5000"
```

### Frontend Setup

```bash
cd frontend

# 1. Install
npm install

# 2. Create .env.local (optional)
# REACT_APP_API_URL=http://localhost:5000/api

# 3. Start
npm start
# Should open http://localhost:3000
```

---

## Troubleshooting

### "Database connection failed"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Create database if missing
psql -U postgres -c "CREATE DATABASE doan_web1;"

# Run setup
npm run db:setup
```

### "Port 3000/5000 already in use"
```bash
# Frontend (change port)
REACT_APP_PORT=3001 npm start

# Backend (change .env)
# PORT=5001
```

### "Cannot find module 'express'"
```bash
# Make sure you're in the right directory
cd backend
npm install
```

### "Claude API errors"
```bash
# Add your API key to .env
CLAUDE_API_KEY=sk-ant-...

# Test API key is valid
curl -H "Authorization: Bearer sk-ant-..." \
  https://api.anthropic.com/v1/messages
```

### "Redis connection refused"
```bash
# Redis is optional, can start without it
# But some features may be limited

# To use Redis:
brew install redis  # Mac
redis-server        # Start Redis
```

---

## Project Structure

```
DoAn_Web1/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/    # 10 pages
│   │   ├── components/
│   │   ├── context/  # AuthContext
│   │   └── utils/    # api.js
│   └── package.json
│
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/   # 11 route files
│   │   ├── services/ # 16 services
│   │   ├── config/   # Database, Redis, WebSocket
│   │   └── middleware/
│   ├── scripts/      # DB setup, seeding
│   └── package.json
│
├── .env.example
├── CLAUDE.md        # Project vision & specs
├── PROJECT_STATUS.md # Completion status
└── SETUP.md         # This file
```

---

## Common Tasks

### Adding a New Content Platform

1. Create service in `backend/src/services/`
2. Add route in `backend/src/routes/`
3. Import & mount in `backend/src/index.js`
4. Update frontend `api.js`
5. Add UI component in frontend

### Creating a New Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Implement API calls using `api.js`
4. Test with backend running

### Database Migrations

```bash
cd backend

# Add migration file in scripts/
# Then run:
npm run db:migrate
```

---

## Testing Endpoints with Curl

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Agents (with userId)
```bash
curl http://localhost:5000/api/agents?userId=1 \
  -H "X-User-ID: 1"
```

### Create Content
```bash
curl -X POST http://localhost:5000/api/content/create \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{"userId":1,"description":"Test post","platforms":["linkedin"]}'
```

---

## Environment Variables Reference

```env
# Server
NODE_ENV=development        # development, production
PORT=5000                   # API port
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doan_web1
DB_USER=postgres
DB_PASSWORD=postgres

# Redis (optional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# Claude API (required for content generation)
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4-7

# Social Platform APIs (optional for Phase 2+)
LINKEDIN_CLIENT_ID=...
TIKTOK_CLIENT_ID=...
FACEBOOK_APP_ID=...
YOUTUBE_API_KEY=...

# Logging
LOG_LEVEL=debug
```

---

## Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify, Vercel, or S3
```

### Backend
```bash
cd backend
npm install --production
npm start
# Deploy to Heroku, AWS, DigitalOcean, etc.
```

### Environment Variables
- Set real API keys
- Set `NODE_ENV=production`
- Use production database
- Use strong `JWT_SECRET`
- Set `FRONTEND_URL` to production URL

---

## Getting Help

1. **Check logs**: Look at terminal output for errors
2. **Read documentation**: Check CLAUDE.md & backend/README.md
3. **Check PROJECT_STATUS.md**: See what's implemented
4. **Test with curl**: Verify API endpoints work

---

## Next Steps After Setup

1. ✅ Explore the UI
2. ✅ Create sample content
3. ✅ Create ad campaigns
4. ✅ View analytics
5. ✅ Test all 10 pages
6. ✅ Integrate real API keys
7. ✅ Deploy to production

---

**Happy coding! 🚀**
