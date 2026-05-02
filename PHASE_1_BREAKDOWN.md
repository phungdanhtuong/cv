# 📍 Phase 1 Detailed Breakdown - Step by Step

**Duration:** 5 weeks  
**Goal:** Launch MVP with content creation + full Facebook/Instagram ads management

---

## 🔹 PHASE 1.1: Backend Foundation Setup (Week 1)

### 1.1.1 Project Structure
- [ ] Create `/backend` directory structure
  ```
  backend/
  ├── src/
  │   ├── index.js              # Main entry point
  │   ├── config/
  │   │   ├── database.js       # PostgreSQL config
  │   │   ├── redis.js          # Redis config
  │   │   └── env.js            # Environment variables
  │   ├── routes/
  │   │   ├── auth.js           # Authentication routes
  │   │   ├── agents.js         # Agent routes
  │   │   ├── content.js        # Content creation routes
  │   │   ├── ads.js            # Ads management routes
  │   │   └── analytics.js      # Analytics routes
  │   ├── controllers/
  │   │   ├── authController.js
  │   │   ├── contentController.js
  │   │   ├── adsController.js
  │   │   └── analyticsController.js
  │   ├── services/
  │   │   ├── agentService.js        # Agent orchestration
  │   │   ├── skillService.js        # Skill execution
  │   │   ├── contentService.js      # Content workflow
  │   │   ├── adsService.js          # Ads workflow
  │   │   ├── claudeService.js       # Claude API wrapper
  │   │   ├── metaAdsService.js      # Meta Ads MCP wrapper
  │   │   └── platformService.js     # Social platform APIs
  │   ├── models/
  │   │   ├── User.js
  │   │   ├── Agent.js
  │   │   ├── Skill.js
  │   │   ├── Content.js
  │   │   ├── Campaign.js            # Ad campaigns
  │   │   ├── AdAccount.js           # Meta ad accounts
  │   │   └── Analytics.js
  │   ├── middleware/
  │   │   ├── auth.js
  │   │   ├── errorHandler.js
  │   │   └── validation.js
  │   └── utils/
  │       ├── logger.js
  │       └── helpers.js
  ├── migrations/                # Database migrations
  ├── seeds/                     # Database seeds
  ├── tests/
  ├── scripts/
  │   ├── setup-db.js
  │   └── seed-agents.js
  ├── package.json
  └── .env
  ```

### 1.1.2 Install Dependencies
- [ ] Initialize `backend/package.json`
  ```bash
  npm init -y
  ```

- [ ] Install core dependencies:
  ```
  express              # Web framework
  pg                   # PostgreSQL client
  redis                # Redis client
  bull                 # Job queue
  dotenv               # Environment variables
  cors                 # CORS middleware
  helmet               # Security headers
  jsonwebtoken         # JWT auth
  bcryptjs             # Password hashing
  ```

- [ ] Install Claude API:
  ```
  @anthropic-ai/sdk   # Official Anthropic SDK
  ```

- [ ] Install Meta Ads MCP:
  ```
  meta-ads-mcp        # Meta Ads Model Context Protocol
  # (or we'll call the remote endpoint)
  ```

- [ ] Install utilities:
  ```
  axios               # HTTP requests
  nodemon             # Dev server
  sequelize           # ORM (optional, we'll use raw SQL)
  ```

### 1.1.3 Environment Configuration
- [ ] Create `/backend/.env` from `.env.example`
- [ ] Fill in required keys:
  - `CLAUDE_API_KEY`
  - `DATABASE_URL`
  - `REDIS_URL`
  - `JWT_SECRET`
  - `FACEBOOK_APP_ID`
  - `FACEBOOK_APP_SECRET`
  - Etc.

### 1.1.4 Main Server Setup
- [ ] Create `backend/src/index.js`:
  ```javascript
  - Import Express
  - Setup middleware (CORS, helmet, body-parser)
  - Connect to PostgreSQL
  - Connect to Redis
  - Setup routes
  - Error handling
  - Start server on port 5000
  ```

- [ ] Test: `npm run dev:backend` should start without errors

---

## 🔹 PHASE 1.2: Database Schema Setup (Week 1-2)

### 1.2.1 Create SQL Migrations
- [ ] User table
  ```sql
  id, email, password, name, created_at, updated_at
  ```

- [ ] Agent table
  ```sql
  id, name, type (strategist/creator/ads-manager/analytics), 
  personality, expertise, config, created_at
  ```

- [ ] Skill table
  ```sql
  id, name, description, markdown_content, platform, 
  created_at, updated_at
  ```

- [ ] Content table
  ```sql
  id, user_id, title, content, platform, 
  status (draft/approved/published), created_at, published_at
  ```

- [ ] Campaign table (Ads)
  ```sql
  id, user_id, name, budget, status, platform (facebook/instagram),
  start_date, end_date, performance_data, created_at
  ```

- [ ] AdAccount table
  ```sql
  id, user_id, platform, account_id, access_token, 
  business_account_id, created_at
  ```

- [ ] Analytics table
  ```sql
  id, user_id, type (content/ad), metric_data, date, created_at
  ```

- [ ] PlatformCredential table
  ```sql
  id, user_id, platform, credential_type, encrypted_value, created_at
  ```

### 1.2.2 Run Migrations
- [ ] Create migration runner in `backend/scripts/setup-db.js`
- [ ] Execute migrations to create all tables
- [ ] Verify tables in PostgreSQL

### 1.2.3 Seed Initial Data
- [ ] Create `backend/scripts/seed-agents.js`
- [ ] Seed 4 agents:
  ```
  1. Content Strategist
  2. Content Creator
  3. Ads Manager
  4. Analytics Agent
  ```

---

## 🔹 PHASE 1.3: Core Agent System (Week 2)

### 1.3.1 Agent Service Architecture
- [ ] Create `backend/src/services/agentService.js`:
  ```javascript
  - loadAgent(agentId)          // Load agent config
  - routeTask(task, agents)     // Route task to appropriate agent
  - executeAgent(agent, input)  // Execute agent with Claude API
  - orchestrateWorkflow(...)    // Multi-agent workflow
  ```

### 1.3.2 Claude API Integration
- [ ] Create `backend/src/services/claudeService.js`:
  ```javascript
  - Initialize Anthropic client with API key
  - sendMessage(prompt, context)
  - streamResponse(prompt)
  - Function calling setup for agent workflows
  ```

### 1.3.3 Agent Definitions
- [ ] Define each agent's system prompt in `backend/src/agents/`:
  - `content-strategist.js` - Brand voice, strategy
  - `content-creator.js` - Writing, design direction
  - `ads-manager.js` - Campaign setup, optimization
  - `analytics.js` - Performance analysis

### 1.3.4 Test Agent System
- [ ] Test 1: Load an agent
- [ ] Test 2: Send simple task to agent
- [ ] Test 3: Multi-agent workflow (Strategist → Creator)

---

## 🔹 PHASE 1.4: Social Media Skills Integration (Week 2)

### 1.4.1 Clone & Parse Skills Repository
- [ ] Clone `social-media-skills` repository
- [ ] Extract all markdown skill files to `/backend/skills/`
  ```
  skills/
  ├── voice-builder.md
  ├── linkedin-post.md
  ├── tiktok-script.md
  ├── instagram-caption.md
  ├── youtube-thumbnail.md
  ├── facebook-copy.md
  └── ... (all 20+ skills)
  ```

### 1.4.2 Skill Loader & Executor
- [ ] Create `backend/src/services/skillService.js`:
  ```javascript
  - loadSkill(skillName)        // Read markdown file
  - parseSkillMetadata(content) // Extract metadata
  - executeSkill(skill, input)  // Pass to Claude with skill context
  ```

### 1.4.3 Skill Integration in Agents
- [ ] Update agent prompts to include relevant skills
  - Content Creator uses: voice-builder, platform-specific skills
  - Ads Manager uses: facebook-ads-copy, targeting skills
  - Analytics uses: analysis skills

### 1.4.4 Test Skills
- [ ] Test voice-builder skill
- [ ] Test LinkedIn post skill
- [ ] Test Facebook ads copy skill

---

## 🔹 PHASE 1.5: Meta Ads MCP Setup (Week 3)

### 1.5.1 Meta Business Account Setup
- [ ] Create Facebook Business Account (if not exist)
- [ ] Get Business Account ID
- [ ] Create Meta Developer App
- [ ] Get App ID & App Secret

### 1.5.2 Setup MCP Server
- [ ] Option 1 - Use Remote MCP (Recommended for MVP):
  ```javascript
  // backend/src/services/metaAdsService.js
  const MCP_ENDPOINT = 'https://mcp.pipeboard.co/meta-ads-mcp'
  // Setup authentication & endpoint calls
  ```

- [ ] Option 2 - Self-hosted MCP (Optional):
  - Install meta-ads-mcp locally
  - Start MCP server
  - Configure backend to connect

### 1.5.3 Meta Ads API Wrapper
- [ ] Create `backend/src/services/metaAdsService.js`:
  ```javascript
  Methods for each Meta Ads MCP tool:
  - createCampaign(config)
  - updateCampaign(campaignId, updates)
  - pauseCampaign(campaignId)
  - uploadCreative(imageBuffer)
  - getAudiences()
  - setTargeting(campaignId, targeting)
  - getBudgetRecommendations()
  - getPerformanceMetrics(campaignId)
  - createABTest(campaignId, variations)
  ... (all 29+ tools)
  ```

### 1.5.4 Facebook OAuth Integration
- [ ] Setup OAuth flow for Facebook Business Account connection
  - Get user authorization
  - Store encrypted access tokens in database
  - Refresh token when needed

### 1.5.5 Test Meta Ads Integration
- [ ] Test: Connect Facebook Business Account
- [ ] Test: Fetch ad accounts
- [ ] Test: Get audience suggestions
- [ ] Test: Create test campaign (with $0 budget)

---

## 🔹 PHASE 1.6: Ads Manager Agent Integration (Week 3)

### 1.6.1 Ads Manager Agent Logic
- [ ] Update `backend/src/agents/ads-manager.js`:
  ```javascript
  - Understand campaign requirements
  - Call Ads Creator skill for copy
  - Use metaAdsService to create campaigns
  - Set targeting based on voice & audience
  - Schedule budget allocation
  - Setup A/B tests
  ```

### 1.6.2 Ads Workflow Service
- [ ] Create `backend/src/services/adsService.js`:
  ```javascript
  - orchestrateCampaignCreation()
    1. Get content from Content Creator Agent
    2. Ask Ads Manager for campaign strategy
    3. Create campaign via Meta Ads API
    4. Setup audiences & targeting
    5. Schedule publication
    6. Setup monitoring
  ```

### 1.6.3 Campaign Monitoring & Optimization
- [ ] Implement background job (Redis Bull):
  ```javascript
  - Every 6 hours: fetch performance metrics
  - Every 24 hours: generate optimization suggestions
  - Alert if metrics drop below threshold
  - Auto-pause underperforming variations
  ```

### 1.6.4 Test Ads Manager Agent
- [ ] Test: Create complete campaign workflow
- [ ] Test: Monitor campaign performance
- [ ] Test: Auto-optimization triggers

---

## 🔹 PHASE 1.7: Frontend Foundation (Week 4)

### 1.7.1 Project Structure
- [ ] Create `/frontend` directory
  ```
  frontend/
  ├── src/
  │   ├── pages/
  │   │   ├── Dashboard.jsx
  │   │   ├── AgentSelector.jsx
  │   │   ├── ContentCreator.jsx
  │   │   ├── AdsManager.jsx       ⭐ NEW
  │   │   ├── Analytics.jsx
  │   │   └── Login.jsx
  │   ├── components/
  │   │   ├── common/
  │   │   │   ├── Navbar.jsx
  │   │   │   ├── Sidebar.jsx
  │   │   │   └── Card.jsx
  │   │   ├── workflow/
  │   │   │   ├── ContentForm.jsx
  │   │   │   ├── AdsForm.jsx      ⭐ NEW
  │   │   │   └── ReviewPanel.jsx
  │   │   └── ...
  │   ├── hooks/
  │   ├── store/       (Redux/Zustand)
  │   ├── utils/
  │   ├── App.jsx
  │   └── index.jsx
  ├── public/
  └── package.json
  ```

### 1.7.2 Setup React Project
- [ ] Create React app: `npx create-react-app frontend` (or Vite)
- [ ] Install dependencies:
  ```
  react-router-dom    # Routing
  axios               # API calls
  zustand/redux       # State management
  tailwindcss         # Styling
  react-query         # Data fetching
  chart.js            # Analytics charts
  ```

### 1.7.3 Pages to Build
- [ ] **Dashboard**
  - Overview of agents status
  - Recent content & campaigns
  - Quick stats (content published, ads spend, ROI)
  - Action buttons (Create content, Create ad, View analytics)

- [ ] **Agent Selector**
  - Display 4 available agents
  - Allow user to select which agents to use
  - Show agent descriptions & capabilities

- [ ] **Content Creator**
  - Multi-step form:
    1. Select platform (LinkedIn, TikTok, Instagram, YouTube)
    2. Describe what you want
    3. Agents work (strategist → creator)
    4. Review content
    5. Publish/Schedule
  - Real-time agent status updates

- [ ] **Ads Manager** ⭐ NEW
  - Step 1: Campaign details (name, budget, duration)
  - Step 2: Select content to promote
  - Step 3: Audience targeting
  - Step 4: Budget allocation
  - Step 5: Review & Create
  - Show created campaigns
  - Edit/pause/delete campaign

- [ ] **Analytics**
  - Dashboard with charts
  - Content performance
  - Ad campaign performance
  - ROI calculation (ad spend vs conversions)
  - Filter by date range

### 1.7.4 API Integration
- [ ] Setup API client service
- [ ] Create API hooks for each endpoint:
  - useAgents()
  - useContent()
  - useCampaigns()
  - useAnalytics()

### 1.7.5 Test Frontend
- [ ] Navigate between pages
- [ ] Forms work
- [ ] API calls successful

---

## 🔹 PHASE 1.8: Platform Integrations (Week 4)

### 1.8.1 Social Platform APIs
- [ ] **LinkedIn API**
  - OAuth setup
  - Post creation
  - Analytics fetch

- [ ] **TikTok API**
  - OAuth setup
  - Video upload (if supported)
  - Caption posting

- [ ] **Instagram API** (via Meta)
  - Part of Facebook Business Account
  - Post creation
  - Story publishing

- [ ] **YouTube API**
  - OAuth setup
  - Video metadata updates
  - Analytics

### 1.8.2 Content Publishing Service
- [ ] Create `backend/src/services/platformService.js`:
  ```javascript
  - publishToLinkedIn(content, auth)
  - publishToTikTok(content, auth)
  - publishToInstagram(content, auth)
  - publishToYoutube(content, auth)
  - publishToFacebook(content, auth)
  ```

### 1.8.3 Unified Publishing Workflow
- [ ] User publishes once
- [ ] System automatically publishes to selected platforms
- [ ] Track which platform, when, performance

### 1.8.4 Test Platform Publishing
- [ ] Publish test content to each platform
- [ ] Verify appearance on actual platforms
- [ ] Test scheduling

---

## 🔹 PHASE 1.9: Testing & MVP Launch (Week 5)

### 1.9.1 End-to-End Testing
- [ ] **Test 1: Content Creation Flow**
  1. User logs in
  2. Selects Content Creator agent
  3. Requests "LinkedIn post about AI"
  4. System generates content
  5. User reviews & approves
  6. Content publishes to LinkedIn

- [ ] **Test 2: Ad Campaign Flow**
  1. User creates new campaign
  2. Selects previously published content
  3. Sets budget ($50-500)
  4. Selects audience (age, interests)
  5. Ads Manager creates campaign
  6. Campaign goes live on Facebook
  7. Metrics tracked daily

- [ ] **Test 3: Analytics**
  1. View all published content
  2. View all ad campaigns
  3. See ROI calculations
  4. Compare performance

### 1.9.2 Performance Testing
- [ ] Load test: 10+ concurrent users
- [ ] API response time < 2s
- [ ] Database queries optimized

### 1.9.3 Security Testing
- [ ] JWT tokens properly validated
- [ ] API keys encrypted & secured
- [ ] SQL injection prevention
- [ ] CORS properly configured

### 1.9.4 Bug Fixes & Polish
- [ ] Fix any issues found
- [ ] Improve UI/UX
- [ ] Add error handling messages
- [ ] Optimize for mobile

### 1.9.5 Documentation
- [ ] Write setup guide for developers
- [ ] Create user guide
- [ ] Document API endpoints
- [ ] Create deployment guide

### 1.9.6 Launch MVP
- [ ] Deploy backend to server
- [ ] Deploy frontend to CDN
- [ ] Setup monitoring & logging
- [ ] Create demo video
- [ ] Invite beta users

---

## ✅ Success Criteria for Phase 1

- ✅ 4 agents working end-to-end
- ✅ Can create content for 4 platforms (LinkedIn, TikTok, Instagram, YouTube)
- ✅ Can create & manage Facebook/Instagram ad campaigns
- ✅ Can track ROI (content + ads combined)
- ✅ UI responsive & intuitive
- ✅ 0 critical bugs
- ✅ Can handle 10+ concurrent users
- ✅ All API integrations working
- ✅ Meta Ads MCP fully functional

---

## 📊 Phase 1 Timeline

```
Week 1: Backend setup + Database
Week 2: Agents + Skills integration
Week 3: Meta Ads MCP + Ads Manager Agent
Week 4: Frontend + Platform APIs
Week 5: Testing + Launch MVP
```

---

**Bây giờ bạn đã có detailed breakdown! Chúng ta bắt đầu từ Phase 1.1 không?** 🚀
