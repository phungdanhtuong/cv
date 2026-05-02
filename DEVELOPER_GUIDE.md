# 👨‍💻 Developer Guide - Installation & Troubleshooting

## 📋 Mục lục
1. [Installation Step-by-Step](#installation-step-by-step)
2. [Troubleshooting Common Errors](#troubleshooting-common-errors)
3. [Configuration Guide](#configuration-guide)
4. [Testing Guide](#testing-guide)
5. [Development Workflow](#development-workflow)
6. [Best Practices](#best-practices)

---

## Installation Step-by-Step

### 1. Prerequisites Check

```bash
# Check Node.js
node --version  # Should be 18+
npm --version   # Should be 8+

# Check PostgreSQL
psql --version  # Should be 14+

# Check Git
git --version
```

If missing, install from:
- Node.js: https://nodejs.org (v18+)
- PostgreSQL: https://postgresql.org/download (v14+)
- Git: https://git-scm.com

### 2. Clone Repository

```bash
git clone https://github.com/phungdanhtuong/doan_web1.git
cd doan_web1
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install

# If errors occur:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Common Issue:** `npm ERR! code ERESOLVE`
- Solution: `npm install --legacy-peer-deps`

### 4. Install Backend Dependencies

```bash
cd ../backend
npm install

# If errors occur:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 5. Setup PostgreSQL

**On Windows (pgAdmin):**
1. Open pgAdmin 4
2. Right-click "Databases" → Create → Database
3. Name it: `doan_web1`
4. Owner: `postgres`
5. Click Create

**On Mac/Linux:**
```bash
# Start PostgreSQL
brew services start postgresql  # Mac
sudo systemctl start postgresql # Linux

# Create database
createdb -U postgres doan_web1

# Verify
psql -U postgres -l | grep doan_web1
```

**Verify Connection:**
```bash
psql -U postgres -d doan_web1 -c "SELECT version();"
# Should return PostgreSQL version
```

### 6. Setup Environment Variables

**Backend:**
```bash
cd backend
cp ../.env.example .env
```

Edit `.env` with your values:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doan_web1
DB_USER=postgres
DB_PASSWORD=postgres  # Your PostgreSQL password

# JWT
JWT_SECRET=dev-secret-key-change-in-production

# Claude API (Required)
CLAUDE_API_KEY=sk-ant-...  # Get from console.anthropic.com

# Others (optional)
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (Optional):**
```bash
cd ../frontend
cat > .env.local << 'ENVEOF'
REACT_APP_API_URL=http://localhost:5000/api
ENVEOF
```

### 7. Setup Database Schema

```bash
cd backend
npm run db:setup
```

**Expected Output:**
```
Creating tables...
✓ All tables created successfully
```

If errors, check:
- PostgreSQL is running
- Database credentials in `.env` are correct
- Port 5432 is not blocked by firewall

### 8. Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Environment: development
WebSocket available at ws://localhost:5000
```

**If port 5000 already in use:**
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process (Linux/Mac)
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### 9. Start Frontend Server

In another terminal:
```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view frontend in the browser.
http://localhost:3000
```

### 10. Verify Installation

1. Open http://localhost:3000
2. Register a new account
3. Login
4. Navigate to different pages
5. Create a sample content item

---

## Troubleshooting Common Errors

### Database Errors

#### ❌ "FATAL: Ident authentication failed for user 'postgres'"

**Cause:** PostgreSQL authentication issue

**Solution:**
```bash
# Linux: Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change line:
# local   all             postgres                                peer
# To:
# local   all             postgres                                trust

# Restart PostgreSQL
sudo systemctl restart postgresql

# Mac: Usually works with default settings
```

#### ❌ "psql: error: could not translate host name 'localhost' to address"

**Cause:** PostgreSQL server not running

**Solution:**
```bash
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start "PostgreSQL 14 Server" from Services
```

#### ❌ "Database 'doan_web1' does not exist"

**Cause:** Database not created

**Solution:**
```bash
# Create database
createdb -U postgres doan_web1

# Or in psql
psql -U postgres
CREATE DATABASE doan_web1;
```

#### ❌ "password authentication failed for user 'postgres'"

**Cause:** Wrong password in .env

**Solution:**
```bash
# Reset PostgreSQL password
psql -U postgres

# In psql prompt:
ALTER USER postgres WITH PASSWORD 'newpassword';

# Update .env
DB_PASSWORD=newpassword
```

---

### Node.js / npm Errors

#### ❌ "npm ERR! code ERESOLVE"

**Cause:** Dependency conflict

**Solution:**
```bash
npm install --legacy-peer-deps
# OR
npm install --force
```

#### ❌ "Cannot find module 'express'"

**Cause:** node_modules not installed or corrupted

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### ❌ "EACCES: permission denied"

**Cause:** Permission issue

**Solution (Mac/Linux):**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use sudo
sudo npm install -g nodemon
```

---

### Backend Server Errors

#### ❌ "PORT 5000 already in use"

**Solution:**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

#### ❌ "ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL not running or wrong host

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check .env DB settings
DB_HOST=localhost
DB_PORT=5432

# If using Docker/VM, use IP instead of localhost
DB_HOST=192.168.x.x
```

#### ❌ "JWT_SECRET is undefined"

**Cause:** Missing environment variable

**Solution:**
```bash
# Edit .env
JWT_SECRET=your_secret_key_here

# Restart server
npm run dev
```

#### ❌ "CLAUDE_API_KEY is missing"

**Cause:** Claude API key not set

**Solution:**
1. Go to https://console.anthropic.com
2. Create API key
3. Add to `.env`:
```env
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
```

---

### Frontend Errors

#### ❌ "PORT 3000 already in use"

**Solution:**
```bash
# Find & kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### ❌ "GET http://localhost:5000/api/... 404"

**Cause:** Backend server not running or wrong URL

**Solution:**
1. Make sure backend is running: `npm run dev`
2. Check REACT_APP_API_URL in .env.local
3. Verify API endpoint exists

#### ❌ "Unexpected token < in JSON at position 0"

**Cause:** Backend returning HTML error instead of JSON

**Solution:**
1. Check backend server logs
2. Verify API endpoint exists
3. Check request headers (X-User-ID, Authorization)

#### ❌ "Cannot read property 'user' of null"

**Cause:** AuthContext not providing user data

**Solution:**
```javascript
// Check AuthContext.jsx
// Make sure localStorage has:
localStorage.getItem('authToken')
localStorage.getItem('userId')
localStorage.getItem('user')
```

---

### General Errors

#### ❌ "git: command not found"

**Cause:** Git not installed

**Solution:** Install from https://git-scm.com

#### ❌ "CORS error: Access-Control-Allow-Origin"

**Cause:** Frontend & backend on different origins

**Solution:** Already fixed in backend `index.js`
```javascript
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
```

Just make sure `FRONTEND_URL=http://localhost:3000` in backend `.env`

---

## Configuration Guide

### Environment Variables

**Essential (.env must have):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doan_web1
DB_USER=postgres
DB_PASSWORD=<your_postgres_password>
CLAUDE_API_KEY=<your_claude_api_key>
JWT_SECRET=<any_random_string>
```

**Optional:**
```env
NODE_ENV=development              # or production
PORT=5000                         # backend port
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379 # if using Redis
LOG_LEVEL=debug                   # debug, info, warn, error
```

**Social Platform APIs (Phase 2+):**
```env
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
YOUTUBE_API_KEY=...
```

### Database Configuration

**PostgreSQL Connection:**
- Host: `localhost` (or your server IP)
- Port: `5432` (default)
- Database: `doan_web1`
- User: `postgres`
- Password: Your PostgreSQL password

**For Remote Database:**
```env
DB_HOST=your-server.com
DB_PORT=5432
DB_NAME=doan_web1
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Testing Guide

### Test Backend APIs with Curl

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response (save the authToken):**
```json
{
  "success": true,
  "user": { "id": 1, "email": "test@example.com", "name": "Test User" },
  "authToken": "eyJhbGc..."
}
```

**Get All Agents:**
```bash
curl http://localhost:5000/api/agents?userId=1 \
  -H "X-User-ID: 1"
```

**Create Content:**
```bash
curl -X POST http://localhost:5000/api/content/create \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "userId": 1,
    "title": "My First Post",
    "description": "This is a test post",
    "contentType": "text",
    "platforms": ["linkedin", "twitter"]
  }'
```

**With Bearer Token:**
```bash
curl http://localhost:5000/api/content/list \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "X-User-ID: 1"
```

### Test Frontend

1. **Registration & Login**
   - Go to http://localhost:3000
   - Click "Register"
   - Fill form → Submit
   - Should redirect to Dashboard

2. **Create Content**
   - Click "Content Creator"
   - Fill form (Title, Description, Platform)
   - Click "Submit"
   - Should see success message

3. **Create Campaign**
   - Click "Ads Manager"
   - Go to "Create Campaign" tab
   - Fill form
   - Click "Create Campaign"
   - Should see in "My Campaigns" tab

4. **Check Analytics**
   - Click "Analytics"
   - Should see content & ad stats

5. **Test All Pages**
   - Dashboard ✓
   - Content Creator ✓
   - Ads Manager ✓
   - Analytics ✓
   - Agent Selector ✓
   - Agent Management ✓
   - A/B Testing ✓
   - Content Calendar ✓
   - Team Collaboration ✓
   - Real-time Dashboard ✓

---

## Development Workflow

### Adding a New Feature

1. **Create Backend Endpoint**
   ```bash
   # 1. Create/update route file
   vim backend/src/routes/newfeature.js
   
   # 2. Import in backend/src/index.js
   import newFeatureRoutes from './routes/newfeature.js';
   app.use('/api/newfeature', newFeatureRoutes);
   
   # 3. Create service if needed
   vim backend/src/services/newFeatureService.js
   
   # 4. Test with curl
   curl http://localhost:5000/api/newfeature ...
   ```

2. **Create Frontend Component**
   ```bash
   # 1. Create page/component
   vim frontend/src/pages/NewFeature.jsx
   
   # 2. Add route in App.jsx
   <Route path="/newfeature" element={<NewFeature />} />
   
   # 3. Add API calls in utils/api.js
   # 4. Test in browser
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add new feature: description"
   ```

### Debugging Tips

**Backend:**
```bash
# See detailed logs
DEBUG=doan_web1:* npm run dev

# Check database directly
psql -U postgres -d doan_web1
SELECT * FROM content;

# Monitor API calls
curl -v http://localhost:5000/api/...
```

**Frontend:**
```bash
# Open browser DevTools (F12)
# Check Console for errors
# Check Network tab for API calls
# Use React DevTools extension

# Check localStorage
localStorage.getItem('authToken')
localStorage.getItem('userId')
```

---

## Best Practices

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Implement new feature"

# Push to branch
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### Code Style

**Backend:**
- Use consistent indentation (2 spaces)
- Add error handling in try-catch
- Log important operations
- Use async/await (not callbacks)

**Frontend:**
- Use functional components (not class)
- Use hooks (useState, useEffect)
- Extract reusable components
- Use Tailwind CSS classes

### Security

**Never commit:**
- Real API keys
- Database passwords
- JWT secrets
- Personal credentials

**Always use .env** for sensitive data

**Before pushing:**
```bash
# Check for secrets
grep -r "sk-ant-" .  # API key
grep -r "password" . # Passwords
```

---

## Useful Commands

```bash
# Backend
npm run dev              # Development mode
npm run db:setup        # Setup database
npm run db:seed         # Seed sample data
npm start              # Production mode

# Frontend
npm start              # Development
npm run build          # Production build
npm test              # Run tests

# Database
npm run db:migrate    # Run migrations

# Git
git status            # Check changes
git log --oneline     # View commits
git diff              # See changes
```

---

## Getting Help

1. **Check logs:** Terminal output usually has the error
2. **Read this guide:** Search for error message above
3. **Check SETUP.md:** Quick start guide
4. **Check backend/README.md:** API documentation
5. **Check PROJECT_STATUS.md:** What's implemented

---

## Common Gotchas

| Issue | Solution |
|-------|----------|
| `userId` is string not number | Backend converts: `parseInt(userId)` |
| Forms not submitting | Check `onSubmit` has `e.preventDefault()` |
| Images not loading | Check image paths & CORS headers |
| localStorage undefined | Check in browser DevTools Console |
| API 401 errors | Missing X-User-ID header or expired token |
| Database locked | Restart PostgreSQL: `sudo systemctl restart postgresql` |

---

**Happy coding! 🚀**

If you get stuck, re-read the error message carefully - it usually tells you exactly what's wrong!
