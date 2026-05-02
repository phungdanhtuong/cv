# 🧪 Phase 1 MVP Testing Guide

This guide will help you test the AI Social Media Agents Platform MVP.

---

## ✅ Pre-Testing Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Redis (optional, for job queue)
- [ ] Claude API key ready
- [ ] Facebook/Meta credentials (optional, for ads testing)

---

## 🔧 Setup Steps

### Step 1: Environment Configuration

```bash
# Copy and edit environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials:
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxx
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_BUSINESS_ACCOUNT_ID=your_account_id
```

### Step 2: Database Setup

```bash
# Create database
createdb doan_web1

# Run migrations to create tables
npm run db:setup

# Seed 4 agents
npm run db:seed
```

### Step 3: Start Backend Server

```bash
cd backend
npm install  # First time only
npm run dev  # Starts on port 5000
```

**Expected Output:**
```
[INFO] Server running on port 5000
[INFO] Environment: development
[INFO] Visit http://localhost:5000 to test
```

### Step 4: Start Frontend Dev Server

```bash
cd frontend
npm install  # First time only
npm run dev  # Starts on port 3000
```

**Expected Output:**
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  press h + enter to show help
```

---

## 🧪 Test Scenarios

### Test 1: Backend Health Check

```bash
# Test API is running
curl http://localhost:5000/

# Expected response:
{
  "message": "AI Social Media Agents Platform API",
  "version": "0.1.0",
  "status": "running"
}
```

```bash
# Check database connection
curl http://localhost:5000/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-02T22:00:00Z"
}
```

### Test 2: List Available Agents

```bash
curl http://localhost:5000/api/agents

# Expected response:
[
  {
    "id": 1,
    "name": "Content Strategist",
    "type": "strategist",
    "personality": "Strategic, insightful, brand-focused",
    "expertise": "Brand voice, content strategy, ...",
    "system_prompt": "You are a Content Strategist..."
  },
  ... (3 more agents)
]
```

### Test 3: Execute Agent (with Claude API)

```bash
curl -X POST http://localhost:5000/api/agents/1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Create a social media strategy for a tech startup",
    "context": "Target audience: developers and engineers"
  }'

# Expected response:
{
  "agentId": 1,
  "result": "Your strategy here from Claude..."
}
```

### Test 4: Create Content Workflow

```bash
curl -X POST http://localhost:5000/api/content/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "description": "Write engaging LinkedIn content about AI trends",
    "platforms": ["linkedin"],
    "contentType": "text"
  }'

# Expected response:
{
  "success": true,
  "strategy": "...",
  "content": {
    "linkedin": "..."
  },
  "saved": [{"id": 1, "status": "draft"}]
}
```

### Test 5: Frontend Dashboard

1. Open http://localhost:3000
2. You should see:
   - Dashboard with stats cards
   - Quick action buttons
   - Navigation sidebar
3. Try clicking on each menu item:
   - ✅ Dashboard loads
   - ✅ Create Content page loads
   - ✅ Ad Campaigns page loads
   - ✅ Analytics page loads
   - ✅ AI Agents page loads

### Test 6: Create Content via Frontend

1. Click "Create Content" in sidebar
2. Fill in form:
   - Description: "Write a TikTok script about our new product"
   - Content Type: "Video Script"
   - Platforms: Select "tiktok"
3. Click "Create Content"
4. Should see:
   - Loading indicator
   - Generated content in response
   - Strategy and platform-specific output

### Test 7: Create Ad Campaign via Frontend

1. Click "Ad Campaigns" in sidebar
2. Fill in campaign form:
   - Name: "Summer Product Launch"
   - Budget: $500 (use slider)
   - Platform: Facebook
   - Age Range: 18-45
   - Duration: 7 days
3. Click "Create Campaign"
4. Should see:
   - Summary panel on right
   - Daily budget calculated
   - Response with campaign details

### Test 8: Analytics Dashboard

1. Click "Analytics" in sidebar
2. Should see:
   - ROI summary cards
   - Content performance table
   - Ad campaign table
   - Overall statistics

### Test 9: Agent Selector

1. Click "AI Agents" in sidebar
2. Should see 4 agents with:
   - Icon and name
   - Personality description
   - Expertise list
3. Try selecting agents:
   - Agents should be selectable (click)
   - Selected agents should highlight
   - Summary shows selected count

---

## 🔍 Common Issues & Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Create database if missing
createdb doan_web1

# Run setup
npm run db:setup
```

### Issue: "Claude API key not found"

**Solution:**
```bash
# Make sure .env has valid key
cat backend/.env | grep CLAUDE_API_KEY

# Get key from: https://console.anthropic.com/
# Then update backend/.env
```

### Issue: "Frontend won't load"

**Solution:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Change port in backend/.env
PORT=5001

# Or kill existing process
lsof -i :5000
kill -9 <PID>
```

### Issue: "404 on API endpoints"

**Solution:**
- Make sure backend is running on port 5000
- Check CORS is enabled (should be auto-enabled for localhost:3000)
- Look at backend console for errors

---

## 📊 Test Results Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:3000
- [ ] All 5 pages load (Dashboard, Content, Ads, Analytics, Agents)
- [ ] Agents API returns 4 agents
- [ ] Agent execution works (with valid Claude API key)
- [ ] Content creation workflow executes
- [ ] Ad campaign creation works
- [ ] Analytics page shows data
- [ ] Agent selector allows selection
- [ ] No console errors in frontend
- [ ] No console errors in backend

---

## 🎯 Testing Depth Levels

### Level 1: Smoke Testing ✅ (Basic)
- Server starts
- Pages load
- No 500 errors

### Level 2: Functional Testing 🟡 (Intermediate)
- All pages render correctly
- Forms can be filled out
- API endpoints work
- Navigation works

### Level 3: Integration Testing 🔴 (Advanced)
- Claude API integration
- Database CRUD operations
- Multi-agent workflows
- Meta Ads MCP connection
- End-to-end scenarios

### Level 4: Performance Testing ⚫ (Expert)
- Load testing (100+ concurrent users)
- Response time benchmarks
- Database query optimization
- Memory usage profiling

---

## 📋 Test Report Template

Save results to `TEST_RESULTS.md`:

```markdown
# Test Results - Phase 1 MVP

**Date:** 2026-05-02
**Tester:** Your Name
**Environment:** Development

## Smoke Tests
- [ ] Backend Health: PASS/FAIL
- [ ] Frontend Load: PASS/FAIL
- [ ] Database Connection: PASS/FAIL

## Functional Tests
- [ ] List Agents: PASS/FAIL
- [ ] Create Content: PASS/FAIL
- [ ] Create Campaign: PASS/FAIL
- [ ] View Analytics: PASS/FAIL

## Issues Found
1. ...
2. ...

## Notes
- ...
```

---

## 🚀 Next: Phase 2 Testing

After Phase 1 passes, Phase 2 will test:
- User authentication
- Multiple user accounts
- Real Facebook/LinkedIn integration
- Database persistence
- Advanced workflows
- Error recovery
- Performance optimization

---

## 📞 Need Help?

1. Check backend logs: `cd backend && npm run dev`
2. Check frontend console: F12 in browser
3. Check database: `psql doan_web1`
4. Review CLAUDE.md for architectural decisions
5. Check PHASE_1_BREAKDOWN.md for implementation details

---

**Happy Testing!** 🎉
