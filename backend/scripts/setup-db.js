import pool from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  personality TEXT,
  expertise TEXT,
  system_prompt TEXT,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  platform VARCHAR(50),
  markdown_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255),
  content TEXT,
  platform VARCHAR(50),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Ad Accounts table
CREATE TABLE IF NOT EXISTS ad_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  platform VARCHAR(50),
  account_id VARCHAR(255),
  business_account_id VARCHAR(255),
  access_token TEXT,
  encrypted_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Campaigns table (Ad campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ad_account_id INTEGER,
  name VARCHAR(255),
  budget DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'draft',
  platform VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  performance_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (ad_account_id) REFERENCES ad_accounts(id)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50),
  entity_id INTEGER,
  entity_type VARCHAR(50),
  metric_data JSONB,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Platform Credentials table
CREATE TABLE IF NOT EXISTS platform_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  platform VARCHAR(50),
  credential_type VARCHAR(50),
  encrypted_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Agent Profiles table (user's agent enable/disable settings)
CREATE TABLE IF NOT EXISTS agent_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT false,
  custom_prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, agent_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Agent Teams table (named profiles/teams)
CREATE TABLE IF NOT EXISTS agent_teams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Team Agents table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_agents (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, agent_id),
  FOREIGN KEY (team_id) REFERENCES agent_teams(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Scheduled Content table
CREATE TABLE IF NOT EXISTS scheduled_content (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  platforms TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (content_id) REFERENCES content(id)
);

-- A/B Tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  variation_a_id INTEGER,
  variation_b_id INTEGER,
  winner VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Optimization History table
CREATE TABLE IF NOT EXISTS optimization_history (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  action VARCHAR(100),
  before_metrics JSONB,
  after_metrics JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Team Invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  invited_by INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',
  permissions JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Team Workspaces table
CREATE TABLE IF NOT EXISTS team_workspaces (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Content Assignments table
CREATE TABLE IF NOT EXISTS content_assignments (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  assigned_to INTEGER NOT NULL,
  assigned_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(content_id),
  FOREIGN KEY (content_id) REFERENCES content(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_user_id ON agent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_teams_user_id ON agent_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_user_id ON scheduled_content(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_history_campaign_id ON optimization_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_content_assignments_team_id ON content_assignments(team_id);
`;

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');

    // Split SQL statements and execute them
    const statements = createTablesSQL.split(';').filter((s) => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        logger.info(`✓ Executed: ${statement.split('\n')[0].substring(0, 50)}...`);
      }
    }

    logger.info('✓ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
