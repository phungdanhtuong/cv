# 📚 DoAn_Web1: AI Social Media Agents Platform

## 🎯 Project Vision
Xây dựng một **All-in-One Web Platform** giúp doanh nghiệp và creators tự động hóa việc tạo, quản lý, và publish content trên social media bằng cách sử dụng một "đội ngũ AI agents" chuyên biệt.

**Tagline:** "Thuê 144 nhân viên AI để chạy social media của bạn"

---

## 🧠 Core Concept

### Inspiration Sources
1. **[agency-agents](https://github.com/msitarzewski/agency-agents)** - 144 specialized AI agents organized by role/domain
   - 12 divisions (Engineering, Design, Sales, Marketing, Product, Finance, etc.)
   - Each agent has distinct personality, expertise, and deliverables
   - MIT License - open source

2. **[social-media-skills](https://github.com/charlie947/social-media-skills)** - 20+ markdown-based skills for social media
   - Proven with 350k+ followers, 100m+ annual views
   - Voice-builder workflow ensures brand consistency
   - Platform-specific skills (LinkedIn, TikTok, Instagram, YouTube, Reels)
   - Built on Claude API

### How They Work Together
```
User Request (e.g., "Create LinkedIn content for tech company")
    ↓
Platform selects agents: Content Strategist → Designer → Content Creator
    ↓
Each agent uses relevant skills from social-media-skills
    ↓
Voice-builder ensures consistent brand tone
    ↓
Content generated → User reviews → Auto-publish or schedule
```

---

## 🏗️ Architecture Overview

### High-Level Flow
```
┌─────────────────────────────────────────────────────────────┐
│                      Web UI (React)                         │
│  Dashboard | Agent Selector | Content Creator | Analytics   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   API Layer (Express)                       │
│  Auth | Agent Router | Skill Executor | Platform Integrator│
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              AI Agent Orchestration (Claude API)            │
│  Agent 1    Agent 2    Agent 3    ...    Agent N            │
│  ↓          ↓          ↓                  ↓                 │
│  Skills → Workflows → Claude → Output                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Database & External Integrations               │
│  PostgreSQL | Redis | LinkedIn | TikTok | Instagram | etc  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Features (MVP)

### Phase 1 (Weeks 1-5) - Content + Full Ads Management
1. **Agent Selection** - Choose 4+ agents (Content, Designer, Ads Manager, Analytics)
2. **Content Creation** - Multi-step form to create social content
3. **Voice Setup** - Define brand voice once, apply everywhere
4. **Multi-Platform Content** - Generate content for LinkedIn, TikTok, Instagram, YouTube
5. **Facebook/Instagram Ads Management** ⭐
   - Create & manage ad campaigns
   - Design creatives & A/B testing
   - Target audiences (interests, behaviors, demographics)
   - Set budgets & scheduling
   - Real-time performance tracking
6. **Unified Review & Publish** - Human approval for both content + ads
7. **ROI Dashboard** - Track both content reach AND ad spend/conversions
8. **Auto Content→Ads** - Convert published content into ads automatically

### Phase 2 (Weeks 5-8)
- 10+ agents
- Content calendar
- Auto-repurposing
- A/B testing
- Scheduled publishing
- Real-time collaboration

### Phase 3 (Weeks 9+)
- All 144 agents
- Advanced analytics
- Auto-optimization
- Enterprise features

---

## 🔑 Core Components

### 1. Agent System
- Load agents from agency-agents
- Each agent has: personality, expertise, workflows
- Router directs tasks to appropriate agents
- Agents communicate via Claude API
- **4 core agents in MVP:**
  - Content Strategist (voice, strategy)
  - Content Creator (write, design)
  - **Ads Manager ⭐ (campaign, budget, optimization)**
  - Analytics (insights, ROI)

### 2. Skills System
- Import markdown skills from social-media-skills
- Skill executor parses & runs skills
- Voice-builder as foundation
- Platform-specific skills for each social media
- **NEW: Facebook/Instagram ads skills** (copywriting, creative strategy)

### 3. Workflow Orchestration
- Define workflow: Input → Agent1 → Agent2 → Output
- Async job processing (Redis/Bull)
- Error handling & retry logic
- Logging & monitoring
- **Ads workflow:** Content Creator → Ads Manager → Auto-publish to Meta

### 4. Meta Ads MCP Integration ⭐
- **What is MCP?** Model Context Protocol - standard for AI to interact with external systems
- **meta-ads-mcp server** - Bridges Claude to Facebook/Instagram Ads
- **29+ available tools:**
  - Campaign management (create, update, pause, delete)
  - Creative upload & testing
  - Audience building & targeting
  - Budget & bid management
  - Performance analytics
  - A/B test automation
- **Setup:** Remote MCP (cloud) or self-hosted Python server
- **How it works:** Ads Manager Agent uses meta-ads-mcp tools to execute ad operations

### 5. Platform Integration
- OAuth for each platform (LinkedIn, TikTok, Instagram, YouTube, Facebook)
- Native APIs for content posting
- **Meta Ads API** (via MCP server)
- Webhook for real-time updates
- Analytics data collection (both organic + paid)

### 6. User Management
- Account creation & authentication
- Team/workspace management
- API keys for programmatic access
- **Facebook Business Account linking**
- **Ad account access management**
- Usage tracking & quotas (content + ad spend)

---

## 📁 Project Structure (Planned)

```
DoAn_Web1/
├── ROADMAP.md                 # This file
├── CLAUDE.md                  # Project memory & context
├── package.json
├── .env.example
│
├── frontend/                  # React app
│   ├── src/
│   │   ├── pages/            # Dashboard, Agent Selector, Content Creator, etc.
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Redux/Zustand state
│   │   └── utils/
│   └── public/
│
├── backend/                   # Express API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/       # Business logic
│   │   ├── services/         # AI, DB, external APIs
│   │   │   ├── agentService.js      # Agent orchestration
│   │   │   ├── skillService.js      # Skill execution
│   │   │   ├── platformService.js   # Social media integrations
│   │   │   └── claudeService.js     # Claude API wrapper
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Auth, validation, logging
│   │   └── config/           # Configuration
│   └── scripts/              # Setup, migrations, etc.
│
├── database/                  # Schema & migrations
│   ├── schema.sql
│   └── migrations/
│
├── skills/                    # Imported from social-media-skills
│   ├── voice-builder.md
│   ├── linkedin-post.md
│   ├── tiktok-script.md
│   └── ...
│
├── agents/                    # Agents from agency-agents
│   ├── social-media-manager.json
│   ├── designer.json
│   └── ...
│
└── docker-compose.yml        # Local development environment
```

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+ (for job queue)
- Claude API key
- Social platform API keys (LinkedIn, TikTok, Instagram, YouTube)

### Local Setup
```bash
# 1. Clone & install
git clone ...
cd DoAn_Web1
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 3. Database
npm run db:setup
npm run db:migrate

# 4. Start development servers
npm run dev        # Runs frontend + backend + Redis

# 5. Visit
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

---

## 🔑 Important Decisions

| Decision | Rationale |
|----------|-----------|
| Claude API as primary | Best for agent orchestration & content quality |
| PostgreSQL | Reliable, scalable, good for complex queries |
| React for frontend | Component-driven, great ecosystem, fast iteration |
| Express for backend | Lightweight, flexible, good for API |
| Redis for queuing | Fast, reliable job processing |
| Markdown skills | Easy to read, version-control friendly, scalable |
| Human approval always | Safety first - no auto-publish without review |
| **Full ads from MVP** | **60% of social budget goes to paid ads - huge market. All-in-one solution (content + ads) = higher value than content only** |
| **meta-ads-mcp** | **Official Meta API, 29+ tools, proven reliable, no reinventing the wheel** |
| **Ads Manager Agent** | **Specialized agent for ads = better optimization than generic agent** |

---

## 📊 Success Criteria

### MVP Success
- ✅ 3 agents working end-to-end
- ✅ Content publishable to 3 platforms (LinkedIn, TikTok, Instagram)
- ✅ Responsive UI that doesn't confuse users
- ✅ Voice-builder works (consistent tone across platforms)
- ✅ Can generate 5+ content types

### Full Success
- ✅ 144 agents available
- ✅ 500+ active users
- ✅ 1M+ pieces of content generated
- ✅ Positive user feedback & retention
- ✅ Sustainable business model

---

## 🎨 Design Principles

1. **User-Centric** - Always require human review before publish
2. **Quality Over Quantity** - Better to generate 1 great post than 5 mediocre ones
3. **Transparency** - Users know which agent is working, what skills are used
4. **Flexibility** - Easy to add new agents, skills, platforms
5. **Performance** - Fast UI, responsive, handles async operations gracefully
6. **Security** - OAuth for platform access, encrypted API keys, audit logs

---

## 🎯 Current Status

- **Phase:** Planning & Foundation
- **Last Updated:** 2026-05-02
- **Next Steps:** 
  1. Setup backend infrastructure
  2. Implement Agent orchestration system
  3. Create basic UI mockups
  4. Integrate Claude API

---

## 🎯 Meta Ads Integration Architecture

### How Ads Manager Agent Works

```
User Request: "Create $500 Facebook campaign for new product"
    ↓
Ads Manager Agent (Claude)
    ↓
Uses meta-ads-mcp tools:
  - Create campaign with budget $500
  - Generate audience targeting based on brand voice
  - Request creatives from Content Creator Agent
  - Upload creatives to campaign
  - Setup A/B test variations
  - Schedule campaign start date
    ↓
Real-time monitoring:
  - Fetch performance metrics every 6 hours
  - Alert on anomalies (high CPC, low CTR, etc.)
  - Auto-adjust bids if ROI drops
    ↓
Daily optimizations:
  - Pause underperforming audience segments
  - Scale budget to winning variations
  - Generate performance insights
```

### Meta Ads MCP Setup Options

**Option 1: Cloud/Remote MCP (Recommended for MVP)**
```
Claude Backend → meta-ads-mcp cloud server → Meta Ads API
- No setup needed (just API keys)
- Hosted by Pipeboard
- URL: https://mcp.pipeboard.co/meta-ads-mcp
```

**Option 2: Self-Hosted MCP (Future)**
```
Claude Backend → Local MCP Python server → Meta Ads API
- More control
- Can add custom logic
- Requires Python setup
```

### Required API Keys/Setup
1. **Meta Business Account** (Facebook/Instagram)
2. **Meta Marketing API key** (from Business Manager)
3. **Meta Developer App** (registered with your company)
4. **Ad Account ID** (from Business Manager)

---

## 🔗 Related Resources

- [agency-agents](https://github.com/msitarzewski/agency-agents) - 144 AI agents library
- [social-media-skills](https://github.com/charlie947/social-media-skills) - Social media specific skills
- [meta-ads-mcp](https://github.com/pipeboard-co/meta-ads-mcp) - **Meta Ads MCP Server**
- [Claude API Docs](https://docs.anthropic.com) - AI model documentation
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-api) - Official Meta Ads API
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/shared/linkedin-api-overview)
- [TikTok for Business API](https://business.tiktok.com)

---

## 📝 Notes for Future Self

- **Why "144 agents"?** Different agents for different roles (Designer, Engineer, Marketer, etc.) - more specialized = better output
- **Why "social-media-skills"?** Proven system with 350k+ followers - we know it works
- **Why build this?** Huge market for AI-powered content creation, all-in-one platform doesn't exist yet
- **Why now?** Claude API is powerful enough, market is ready, AI agents are hot topic
- **Remember:** Start small (MVP), validate with users, then scale. Don't try to build everything at once.

