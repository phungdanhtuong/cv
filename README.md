# 🚀 AI Social Media Agents Platform

An all-in-one web platform that leverages 144 specialized AI agents to automate social media content creation, management, and publishing.

**Tagline:** "Hire 144 AI employees to run your social media"

## 🎯 What is This?

This platform combines two powerful open-source projects:

1. **[agency-agents](https://github.com/msitarzewski/agency-agents)** - 144 specialized AI agents (designers, engineers, marketers, content creators, etc.)
2. **[social-media-skills](https://github.com/charlie947/social-media-skills)** - Proven skills for social media content generation (used by accounts with 350k+ followers)

The result? A unified platform where you can create professional social media content across multiple platforms (LinkedIn, TikTok, Instagram, YouTube) in minutes, not hours.

## ✨ Key Features

### MVP (Phase 1)
- 🤖 3-5 specialized AI agents working together
- 📝 Content generation for multiple platforms
- 🎨 Consistent brand voice across all channels
- 👀 Human review before publishing
- 📊 Basic analytics & performance tracking

### Roadmap
- Full 144-agent system
- Advanced automation & scheduling
- Multi-user collaboration
- Enterprise-grade analytics
- Custom agent training

## 🏗️ Architecture

```
┌─────────────────┐
│   React UI      │  Dashboard | Agent Selector | Content Creator
├─────────────────┤
│   Express API   │  Routes | Controllers | Services
├─────────────────┤
│  Claude API     │  Agent Orchestration | Skill Execution
├─────────────────┤
│  PostgreSQL     │  Users | Content | Analytics
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Claude API key

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd DoAn_Web1

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Setup database
npm run db:setup
npm run db:migrate

# 5. Start development servers
npm run dev

# Access:
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

## 📁 Project Structure

```
DoAn_Web1/
├── ROADMAP.md          # Detailed development roadmap
├── CLAUDE.md          # Project memory & context
├── frontend/          # React application
├── backend/           # Express API server
├── database/          # SQL schemas & migrations
├── skills/            # Imported social media skills
├── agents/            # AI agent configurations
└── docker-compose.yml # Local dev environment
```

## 📚 Documentation

- **[ROADMAP.md](./ROADMAP.md)** - Detailed development phases and timeline
- **[CLAUDE.md](./CLAUDE.md)** - Project context, architecture, and design decisions

## 🔑 Core Concepts

### Agents
AI personalities specialized in different roles (Content Creator, Designer, Strategist, etc.). Each agent has unique expertise and workflows.

### Skills
Markdown-based knowledge modules that teach agents how to perform specific tasks. Example: "voice-builder" skill defines brand voice.

### Workflows
Orchestrated sequences of agents working together. Example: Content Strategist → Designer → Content Creator → Publisher

## 🛠️ Tech Stack

- **Frontend:** React, TailwindCSS, Redux
- **Backend:** Node.js, Express, PostgreSQL, Redis
- **AI:** Claude API (Anthropic)
- **DevOps:** Docker, GitHub Actions

## 📊 Project Status

**Current Phase:** Planning & Foundation Setup  
**Last Updated:** 2026-05-02

### Completed
- ✅ Project vision & roadmap
- ✅ CLAUDE.md memory file
- ✅ Architecture design
- ✅ Tech stack selection

### Next Steps
1. Setup backend infrastructure
2. Implement agent orchestration
3. Create frontend UI mockups
4. Integrate Claude API
5. Implement first workflow

## 🤝 Contributing

See [CLAUDE.md](./CLAUDE.md#contributing--team) for contribution guidelines.

## 📜 License

MIT License - See LICENSE file for details

## 🔗 Resources

- [Claude API Documentation](https://docs.anthropic.com)
- [agency-agents Repository](https://github.com/msitarzewski/agency-agents)
- [social-media-skills Repository](https://github.com/charlie947/social-media-skills)

## 📧 Questions?

Check [CLAUDE.md](./CLAUDE.md) for project context and design decisions.

---

**Built with ❤️ using Claude API and AI Agents**
