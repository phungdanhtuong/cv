# 🚀 AI Social Media Agents Platform

**Xây dựng một All-in-One Web Platform giúp doanh nghiệp và creators tự động hóa việc tạo, quản lý, và publish content trên social media bằng một "đội ngũ AI agents" chuyên biệt.**

---

## 📚 Documentation

### 👨‍💻 For New Developers

**Start here if you just joined the project:**

1. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** ← **START HERE** 🌟
   - Step-by-step installation guide
   - Troubleshooting 30+ common errors
   - Configuration guide
   - Testing & debugging tips

2. **[SETUP.md](./SETUP.md)** - Quick 5-minute setup
   - Quick start commands
   - Environment variables reference
   - Common troubleshooting

3. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Project overview
   - What's already implemented
   - Feature checklist
   - Technology stack

### 📖 For Project Context

4. **[CLAUDE.md](./CLAUDE.md)** - Project vision & specifications
   - Project goals & inspiration
   - Architecture overview
   - Phase breakdown (1, 2, 3)
   - Technology decisions

### 🔧 Backend Documentation

5. **[backend/README.md](./backend/README.md)** - Backend API guide
   - API endpoints documentation
   - Service descriptions
   - Database schema
   - WebSocket guide

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites
```bash
node --version        # Should be 18+
npm --version         # Should be 8+
psql --version        # Should be 14+
```

### Setup
```bash
# 1. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 2. Setup database
npm run db:setup

# 3. Create .env file
cp ../.env.example .env
# Edit .env with your database password & API keys

# 4. Start servers
npm run dev                    # Backend (port 5000)
cd ../frontend && npm start    # Frontend (port 3000)
```

### Test
Open http://localhost:3000 → Register → Create content

---

## 📁 Project Structure

```
DoAn_Web1/
├── 📖 README.md                    ← You are here
├── 👨‍💻 DEVELOPER_GUIDE.md           ← Installation & Troubleshooting (START HERE!)
├── 🚀 SETUP.md                     ← Quick start (5 min)
├── 📊 PROJECT_STATUS.md            ← Project overview
├── 📚 CLAUDE.md                    ← Vision & specs
│
├── frontend/                       # React app (10 pages)
│   ├── src/
│   │   ├── pages/                 # 10 pages (Phase 1/2 + Phase 3)
│   │   ├── components/            # Reusable components
│   │   ├── context/AuthContext.js # Auth state management
│   │   └── utils/api.js           # Centralized API calls
│   └── package.json
│
├── backend/                        # Express API
│   ├── src/
│   │   ├── routes/                # 11 API route files
│   │   ├── services/              # 16 business logic services
│   │   ├── middleware/auth.js     # Authentication
│   │   └── config/                # Database, Redis, WebSocket
│   ├── scripts/setup-db.js        # Database schema
│   ├── README.md                  # Backend API docs
│   └── package.json
│
├── .env.example                   # Environment template
└── .gitignore
```

---

## ✨ Features

### Phase 1 - Content + Ads Management ✅
- 144 AI agents with enable/disable
- Multi-platform content creation (LinkedIn, TikTok, Instagram, YouTube)
- Facebook/Instagram ads management
- Content approval workflow
- Basic analytics & ROI tracking

### Phase 2 - Extended Features ✅
- Agent teams/profiles
- Content calendar & scheduling
- A/B testing framework
- Team collaboration
- Auto-optimization suggestions

### Phase 3 - Advanced Features ✅
- Real-time dashboard (WebSocket)
- Advanced analytics
- Multi-agent orchestration
- Complete documentation

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **PostgreSQL 14+** - Database
- **Redis 7+** - Cache/queue (optional)
- **WebSocket** - Real-time updates
- **JWT + Bcrypt** - Authentication

### Integrations
- **Anthropic Claude API** - AI content generation
- **Meta Ads API** - Facebook/Instagram campaigns
- **LinkedIn API** - LinkedIn campaigns
- **TikTok API** - TikTok campaigns
- **Google Ads API** - Google campaigns

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| React Pages | 10 |
| API Endpoints | 50+ |
| Services | 16 |
| Database Tables | 15 |
| Lines of Code | 10,000+ |
| Supported Platforms | 6 |
| AI Agents | 144 |

---

## 🚀 Getting Started

### 1️⃣ First Time Setup

**Read in this order:**
1. This README (current file)
2. [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) ← **MOST IMPORTANT**
3. Follow the step-by-step installation guide

### 2️⃣ After Installation

- Test the application at http://localhost:3000
- Try creating content & campaigns
- Check all 10 pages work
- Read [backend/README.md](./backend/README.md) for API details

### 3️⃣ Start Development

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes, test, commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature
```

---

## ❓ Common Questions

### Q: Installation fails with "Cannot find module"
**A:** Run `npm install` in the correct directory (frontend or backend)

### Q: "Database connection failed"
**A:** Check PostgreSQL is running and credentials in `.env` are correct

### Q: "Port 3000/5000 already in use"
**A:** See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#-port-3000-already-in-use) for solutions

### Q: How do I add a new feature?
**A:** 
1. Create backend route in `backend/src/routes/`
2. Create service in `backend/src/services/`
3. Create frontend component in `frontend/src/pages/`
4. Add API call in `frontend/src/utils/api.js`
5. Test & commit

### Q: Where's the API documentation?
**A:** See [backend/README.md](./backend/README.md) for 50+ endpoints

---

## 🐛 Troubleshooting

**Most problems are covered in:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

Quick links to common issues:
- [Database errors](./DEVELOPER_GUIDE.md#database-errors)
- [npm errors](./DEVELOPER_GUIDE.md#nodejs--npm-errors)
- [Backend errors](./DEVELOPER_GUIDE.md#backend-server-errors)
- [Frontend errors](./DEVELOPER_GUIDE.md#frontend-errors)
- [Configuration help](./DEVELOPER_GUIDE.md#configuration-guide)

---

## 📞 Need Help?

1. **Check Documentation**
   - [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Most common solutions
   - [SETUP.md](./SETUP.md) - Quick troubleshooting
   - [backend/README.md](./backend/README.md) - API reference

2. **Search Error Message**
   - Read error carefully
   - Google the error
   - Check DEVELOPER_GUIDE.md

3. **Check Logs**
   - Backend: Terminal output where `npm run dev` runs
   - Frontend: Browser DevTools (F12)
   - Database: `psql` command line

---

## 📋 Checklist for New Developers

- [ ] Read this README
- [ ] Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [ ] Install Node.js 18+, PostgreSQL 14+
- [ ] Follow installation steps
- [ ] Test frontend at http://localhost:3000
- [ ] Test backend with curl
- [ ] Create your first feature branch
- [ ] Ask questions in team chat

---

## 🎯 Project Goals

✅ **Phase 1 (Weeks 1-5):** MVP with content + ads management  
✅ **Phase 2 (Weeks 5-8):** Extended features (scheduling, A/B testing, teams)  
✅ **Phase 3 (Weeks 9+):** All 144 agents, advanced analytics, auto-optimization  

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/feature-name

# Create Pull Request on GitHub
```

**Branch naming:**
- `feature/add-login` - New feature
- `fix/auth-bug` - Bug fix
- `docs/update-readme` - Documentation
- `refactor/api-cleanup` - Code cleanup

---

## 🔒 Security

**Never commit:**
- API keys (use `.env`)
- Database passwords (use `.env`)
- JWT secrets (use `.env`)
- Personal credentials

**Before pushing:**
```bash
# Check for secrets
grep -r "sk-ant-" .
grep -r "password" .
```

---

## 📞 Contact

- **Project Lead:** [Check git history for context]
- **Documentation:** This repo
- **Issues:** Check DEVELOPER_GUIDE.md first

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** 2026-05-02  
**Status:** ✅ Ready for Development & Testing

---

## 🚀 Next Steps

1. **[Read DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** ← Most important!
2. Follow step-by-step installation
3. Test the application
4. Start building features

**Happy coding!** 🎉
