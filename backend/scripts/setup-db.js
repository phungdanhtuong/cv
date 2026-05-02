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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
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
