# Backend - AI Social Media Agents Platform

## Cấu trúc Backend

```
backend/
├── src/
│   ├── index.js                 # Main server entry point
│   ├── config/                  # Configuration files
│   │   ├── env.js              # Environment variables
│   │   ├── database.js         # PostgreSQL connection
│   │   ├── redis.js            # Redis connection
│   │   └── websocket.js        # WebSocket server
│   ├── middleware/             # Express middleware
│   │   └── auth.js            # Authentication middleware
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── agents.js          # Agent management
│   │   ├── content.js         # Content creation/management
│   │   ├── ads.js             # Ad campaign management
│   │   ├── analytics.js       # Analytics & ROI tracking
│   │   ├── agentManagement.js # Agent enable/disable/teams
│   │   ├── abTesting.js       # A/B testing
│   │   ├── contentCalendar.js # Content scheduling
│   │   ├── teamCollaboration.js # Team management
│   │   ├── dashboard.js       # Dashboard metrics
│   │   ├── scheduling.js      # Job scheduling
│   │   └── optimization.js    # Auto-optimization
│   ├── services/              # Business logic
│   │   ├── claudeService.js   # Claude API wrapper
│   │   ├── contentService.js  # Content management
│   │   ├── adsService.js      # Ads management
│   │   ├── analyticsService.js # Analytics
│   │   ├── agentService.js    # Agent loading/execution
│   │   ├── agentManagementService.js # Agent profiles/teams
│   │   ├── abTestingService.js # A/B test analysis
│   │   ├── contentCalendarService.js # Scheduling
│   │   ├── teamCollaborationService.js # Team features
│   │   ├── realtimeDashboardService.js # Real-time updates
│   │   ├── metaAdsService.js  # Meta (Facebook/Instagram) ads
│   │   ├── linkedinAdsService.js # LinkedIn ads
│   │   ├── tiktokAdsService.js # TikTok ads
│   │   └── ... other services
│   └── utils/                 # Utility functions
│       └── logger.js          # Logging utility
├── scripts/
│   ├── setup-db.js           # Database schema setup
│   ├── seed-agents.js        # Seed sample agents
│   └── migrate.js            # Database migrations
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+ (optional but recommended for job queues)
- Claude API key
- Social platform API keys (optional for Phase 2+)

## Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create `.env` file from `.env.example`:

```bash
cp ../.env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doan_web1
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# Claude API
CLAUDE_API_KEY=your_claude_api_key

# Optional: Social Platform APIs
LINKEDIN_CLIENT_ID=...
TIKTOK_CLIENT_ID=...
FACEBOOK_APP_ID=...
```

### 3. Database Setup

Ensure PostgreSQL is running, then setup database:

```bash
npm run db:setup
```

This will create all tables defined in `scripts/setup-db.js`.

### 4. Seed Sample Data (Optional)

```bash
npm run db:seed
```

This loads sample agents into the database.

## Running the Backend

### Development Mode

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Content Management
- `POST /api/content/create` - Create content
- `GET /api/content/list` - List user content
- `GET /api/content/:id` - Get single content
- `POST /api/content/:id/approve` - Approve content
- `POST /api/content/:id/reject` - Reject content
- `DELETE /api/content/:id` - Delete content

### Ad Campaigns
- `POST /api/ads/campaigns/create` - Create campaign
- `GET /api/ads/campaigns/list` - List campaigns
- `GET /api/ads/campaigns/:id/metrics` - Get campaign metrics
- `POST /api/ads/campaigns/:id/approve` - Approve campaign
- `POST /api/ads/campaigns/:id/pause` - Pause campaign

### Analytics
- `GET /api/analytics/summary` - Get summary stats
- `GET /api/analytics/content` - Get content analytics
- `GET /api/analytics/ads` - Get ad analytics
- `GET /api/analytics/roi` - Get ROI calculations

### Agent Management
- `GET /api/agent-management/all` - Get all agents
- `GET /api/agent-management/enabled` - Get enabled agents
- `POST /api/agent-management/toggle/:agentId` - Toggle agent
- `POST /api/agent-management/teams` - Create team
- `GET /api/agent-management/teams` - Get user teams
- `POST /api/agent-management/teams/:teamId/switch` - Switch team

### A/B Testing
- `POST /api/ab-tests/create` - Create A/B test
- `GET /api/ab-tests/:testId/analyze` - Analyze test results
- `GET /api/ab-tests/user/:userId/history` - Get test history
- `GET /api/ab-tests/user/:userId/stats` - Get stats

### Content Calendar
- `POST /api/calendar/add` - Add to calendar
- `GET /api/calendar/month/:userId/:year/:month` - Get month view
- `POST /api/calendar/reschedule/:scheduleId` - Reschedule

### Team Collaboration
- `POST /api/team/invite` - Invite team member
- `GET /api/team/user/:userId` - Get user teams
- `GET /api/team/:teamId/members` - Get team members

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard metrics

## Authentication

All protected endpoints require one of:

1. **X-User-ID Header**:
   ```
   X-User-ID: 1
   ```

2. **Authorization Bearer Token**:
   ```
   Authorization: Bearer <jwt_token>
   ```

3. **Query Parameter**:
   ```
   GET /api/content/list?userId=1
   ```

## Database Schema

Main tables:
- `users` - User accounts
- `agents` - AI agents
- `content` - User-created content
- `campaigns` - Ad campaigns
- `scheduled_content` - Content schedule
- `ab_tests` - A/B test configurations
- `agent_profiles` - User's agent preferences
- `agent_teams` - Named agent groups
- `teams` - Collaboration teams
- `team_members` - Team membership
- `analytics` - Tracked metrics

## WebSocket

Real-time dashboard available at:
```
ws://localhost:5000
```

Query parameters:
- `userId` - Required for subscription

Events:
- `metrics` - Real-time metrics updates
- `event` - Custom events

## Services & Features Implemented

### Phase 1 (MVP - Content + Ads)
- ✅ Agent selection & management
- ✅ Content creation with multi-platform support
- ✅ Ad campaign creation (Facebook, Instagram, Google, LinkedIn, TikTok)
- ✅ Approval workflows
- ✅ Basic analytics & ROI tracking

### Phase 2 (Extended)
- ✅ Agent teams/groups
- ✅ Content calendar & scheduling
- ✅ A/B testing framework
- ✅ Team collaboration
- ✅ Auto-optimization suggestions

### Phase 3 (Full Features)
- ✅ Real-time dashboard (WebSocket)
- ✅ Advanced analytics
- ✅ Multi-agent orchestration
- ⏳ Full 144 agents support (in progress)

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in `.env`
- Run `npm run db:setup` to create tables

### Port Already in Use
- Change PORT in `.env` (default: 5000)
- Or kill process using port 5000

### Missing Claude API Key
- Errors on content generation will fail gracefully
- Set CLAUDE_API_KEY in `.env` for AI features

### Redis Not Available
- Redis is optional (used for job queue)
- Without Redis, some async features may be limited
- Set REDIS_URL if available

## Development Notes

- Services use PostgreSQL for persistence
- All routes protected with userId validation
- Claude API integration in `claudeService.js`
- Real-time updates via WebSocket in `config/websocket.js`
- Logging via `utils/logger.js`

## Next Steps

1. Setup PostgreSQL and run `npm run db:setup`
2. Create `.env` file with required keys
3. Run `npm run dev` to start server
4. Test endpoints with frontend or Postman
5. Add real API keys for social platforms & Claude
