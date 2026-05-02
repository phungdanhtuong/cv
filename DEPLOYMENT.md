# 🚀 Deployment Checklist & Pre-Launch Guide

**Last Updated:** 2026-05-02  
**Current Status:** Development Complete - Ready for Testing & Staging

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All 10 frontend pages tested manually
- [ ] All 50+ backend endpoints tested with curl
- [ ] No console errors in browser (F12)
- [ ] No errors in backend logs
- [ ] All TypeScript/linting passes (if applicable)
- [ ] No hardcoded credentials in code
- [ ] No console.log() left in production code

### ✅ Environment Setup
- [ ] `.env.production` configured with real values
- [ ] All required API keys added:
  - [ ] Claude API key (CLAUDE_API_KEY)
  - [ ] Meta/Facebook API keys (if using)
  - [ ] LinkedIn API keys (if using)
  - [ ] TikTok API keys (if using)
  - [ ] Google Ads API key (if using)
  - [ ] JWT secret is strong & unique
- [ ] Database password is NOT default password
- [ ] All environment variables documented

### ✅ Database
- [ ] Database migrations run successfully
- [ ] Database backups configured
- [ ] Connection pooling optimized
- [ ] Indexes created for performance
- [ ] Regular backup schedule set up

### ✅ Security
- [ ] No API keys in git history (git-filter-branch if needed)
- [ ] SSL/TLS certificate configured
- [ ] CORS headers properly set
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Authentication & authorization working
- [ ] Password hashing (bcrypt) verified

### ✅ Performance
- [ ] Frontend bundle optimized (npm run build)
- [ ] API response times acceptable (<500ms)
- [ ] Database queries optimized
- [ ] Caching strategy implemented (Redis)
- [ ] Image optimization done
- [ ] No N+1 query problems

### ✅ Testing
- [ ] Manual testing of all 10 pages
- [ ] Content creation → Publishing flow tested
- [ ] Ad campaign creation → Approval flow tested
- [ ] Analytics data showing correctly
- [ ] Real-time dashboard working
- [ ] A/B testing workflow verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness checked

### ✅ Monitoring & Logging
- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Logging level set appropriately
- [ ] Monitoring dashboard set up
- [ ] Alert thresholds configured
- [ ] Health check endpoint working (/health)

### ✅ Documentation
- [ ] API documentation complete (✅ backend/README.md)
- [ ] Deployment guide written
- [ ] Admin runbook created
- [ ] Incident response plan ready
- [ ] Team trained on deployment

---

## 🔌 Facebook/Meta Ads MCP Setup

### Current Status
✅ **metaAdsService.js fully implemented with MCP integration**

The backend already has:
- `metaAdsService.js` - Complete MCP client
- Tools implemented:
  - ✅ Create campaigns
  - ✅ Update campaigns
  - ✅ Pause/activate campaigns
  - ✅ Create ad sets
  - ✅ Upload creatives
  - ✅ Get audiences
  - ✅ Search targeting
  - ✅ Get performance metrics
  - ✅ Create A/B tests
  - ✅ Get optimization suggestions
  - ✅ Get budget recommendations

### Setup Meta Ads MCP

**Option 1: Use Cloud MCP Server (Recommended for MVP)**
```env
# In .env.production
META_ADS_MCP_ENDPOINT=https://mcp.pipeboard.co/meta-ads-mcp

# Add Meta API credentials
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_BUSINESS_ACCOUNT_ID=your_business_account_id
```

**Option 2: Self-Hosted MCP Server (Advanced)**
```bash
# Install Meta Ads MCP server
pip install meta-ads-mcp

# Start MCP server
python -m meta_ads_mcp --port 8000

# In .env.production
META_ADS_MCP_ENDPOINT=http://localhost:8000
```

### Get Meta API Credentials

1. **Create Facebook Business Account**
   - Go to https://business.facebook.com
   - Create new business account

2. **Create App**
   - Go to https://developers.facebook.com/apps
   - Create new app
   - Add "Marketing API" product

3. **Get Credentials**
   - App ID: Settings → Basic
   - App Secret: Settings → Basic  
   - Business Account ID: Settings → Business Accounts

4. **Add to .env**
   ```env
   FACEBOOK_APP_ID=123456789
   FACEBOOK_APP_SECRET=abc123xyz
   FACEBOOK_BUSINESS_ACCOUNT_ID=456789123
   ```

### Test Meta Ads MCP

```bash
# Backend running, test endpoint
curl -X POST http://localhost:5000/api/ads/campaigns/create \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "userId": 1,
    "name": "Test Campaign",
    "budget": 100,
    "platform": "facebook"
  }'
```

---

## 🚀 Deployment Steps

### Phase 1: Staging Deployment

```bash
# 1. Clone on staging server
git clone https://github.com/phungdanhtuong/doan_web1.git
cd doan_web1

# 2. Setup environment
cp .env.example .env.staging
# Edit .env.staging with staging values

# 3. Install & setup database
cd backend
npm install
npm run db:setup  # Creates tables

# 4. Test backend
npm run dev
# Verify: http://staging-api.example.com/health

# 5. Build & start frontend
cd ../frontend
npm install
npm run build
# Deploy dist/ to staging

# 6. Run integration tests
# Manual test all 10 pages
# Test content creation flow
# Test ad campaign flow
```

### Phase 2: Production Deployment

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ to:
# - Netlify, Vercel, S3, CloudFront
# - OR traditional web server (nginx, Apache)
```

**Backend:**
```bash
cd backend
npm install --production
npm start
# Run on:
# - Heroku, AWS EC2, DigitalOcean
# - OR traditional VPS with nginx reverse proxy
```

**Database:**
```bash
# Use managed PostgreSQL:
# - AWS RDS
# - Heroku Postgres
# - DigitalOcean Managed Database
# - Google Cloud SQL

# Or self-hosted with backups
```

---

## 🔒 Security Checklist

- [ ] HTTPS/SSL enabled on all endpoints
- [ ] Environment variables NOT in git
- [ ] Database credentials secure
- [ ] API keys rotated
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] Input validation strict
- [ ] SQL injection prevented (parameterized queries ✅)
- [ ] XSS protection enabled
- [ ] Authentication required on protected routes ✅
- [ ] Authorization checks in place ✅

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | <3s | ? (test after deploy) |
| API Response | <500ms | ? (test after deploy) |
| Database Query | <100ms | ? (optimize if needed) |
| Lighthouse Score | >90 | ? (test after build) |
| Uptime | 99.9% | TBD |

---

## 🔄 Deployment Environments

### Local (Development)
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
Database: localhost:5432/doan_web1
```

### Staging (Testing)
```
Frontend: https://staging.example.com
Backend: https://api-staging.example.com
Database: AWS RDS (staging)
```

### Production
```
Frontend: https://example.com
Backend: https://api.example.com
Database: AWS RDS (production)
Redis: AWS ElastiCache (production)
```

---

## 🛠️ Post-Deployment

### 1. Smoke Tests
```bash
# Frontend
curl https://example.com
# Should return 200

# Backend
curl https://api.example.com/health
# Should return: { status: "ok", database: "connected" }

# API endpoints
curl https://api.example.com/api/agents?userId=1
# Should return agent list
```

### 2. Monitor
- [ ] Error tracking active (Sentry, etc.)
- [ ] Performance monitoring running (New Relic, etc.)
- [ ] Logs aggregated (ELK, Splunk, etc.)
- [ ] Uptime monitoring active (Pingdom, UptimeRobot)
- [ ] Alerts configured & tested

### 3. Team Notification
- [ ] Slack/email notification sent
- [ ] Changelog updated
- [ ] Analytics enabled
- [ ] Customer communication sent (if applicable)

---

## 🔙 Rollback Plan

If deployment fails:

```bash
# Git rollback
git revert <commit-hash>
git push origin main

# Database rollback
# Restore from backup:
psql -U postgres -d doan_web1 < backup.sql

# Frontend rollback
# Redeploy previous version from git tag
```

---

## 📞 Deployment Support

### If Things Break

1. **Check logs**
   - Backend: Application logs
   - Frontend: Browser console (F12)
   - Database: PostgreSQL logs

2. **Check services**
   - Is backend running? `ps aux | grep node`
   - Is database running? `psql -U postgres`
   - Is Redis running? `redis-cli ping`

3. **Common fixes**
   - Restart backend: `npm run dev`
   - Clear frontend cache: Shift+Refresh
   - Check database connection: `.env` credentials
   - Check API keys: CLAUDE_API_KEY, Meta creds

4. **Contact**
   - Review DEVELOPER_GUIDE.md troubleshooting
   - Check git logs for recent changes
   - Review deployment notes

---

## 📈 Success Metrics (Post-Launch)

- [ ] Zero 500 errors for first 24h
- [ ] <1% error rate
- [ ] All 10 pages loading correctly
- [ ] Database connection stable
- [ ] Real-time updates working
- [ ] Users able to create content
- [ ] Users able to create campaigns
- [ ] Analytics data accurate
- [ ] No performance degradation

---

## 🎯 Phase-Based Deployment Plan

### Phase 1: MVP (Current)
- ✅ 10 pages developed
- ✅ 50+ endpoints implemented
- ✅ Database schema complete
- ✅ Meta Ads MCP ready
- **Next:** Testing & Staging deployment

### Phase 2: Extended (After MVP stabilizes)
- Content scheduling optimization
- Advanced A/B testing
- Team collaboration enhancements
- More AI agents

### Phase 3: Full Features (Later)
- All 144 agents
- Enterprise features
- Advanced analytics

---

## 📝 Notes

- **MCP Server:** Already integrated in backend, just needs Meta API keys
- **Database:** Schema ready, just needs PostgreSQL instance
- **Frontend:** Ready to build & deploy
- **Backend:** Ready to start with npm start

---

## ✅ Final Checklist Before Production

- [ ] All endpoints tested
- [ ] Database backups working
- [ ] Error tracking configured
- [ ] Monitoring active
- [ ] Team trained
- [ ] Rollback plan ready
- [ ] Documentation complete
- [ ] Security scan passed
- [ ] Load testing done
- [ ] Customer communication ready

---

**Status:** ✅ Ready to Deploy

All code complete. Just need:
1. Real API keys
2. Production database
3. Deployment server
4. Final testing

**Estimated deployment time:** 2-4 hours setup + 2-3 hours testing
