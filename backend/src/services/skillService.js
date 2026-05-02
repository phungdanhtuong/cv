import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.join(__dirname, '../../skills');

export const skillService = {
  async loadSkill(skillName) {
    try {
      // Try to load from database first
      let result = await pool.query('SELECT * FROM skills WHERE name = $1', [skillName]);

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // If not in DB, try to load from file
      const skillPath = path.join(SKILLS_DIR, `${skillName}.md`);
      const content = await fs.readFile(skillPath, 'utf-8');

      const skill = {
        name: skillName,
        content: content,
        platform: this.getPlatformFromSkillName(skillName),
      };

      return skill;
    } catch (error) {
      logger.warn(`Skill ${skillName} not found:`, error.message);
      return null;
    }
  },

  async getAllSkills() {
    try {
      const result = await pool.query('SELECT * FROM skills');
      return result.rows;
    } catch (error) {
      logger.error('Error getting skills:', error.message);
      throw error;
    }
  },

  async getSkillsByPlatform(platform) {
    try {
      const result = await pool.query('SELECT * FROM skills WHERE platform = $1', [platform]);
      return result.rows;
    } catch (error) {
      logger.error(`Error getting skills for platform ${platform}:`, error.message);
      throw error;
    }
  },

  async executeSkill(skillName, input, additionalContext = null) {
    try {
      const skill = await this.loadSkill(skillName);

      if (!skill) {
        logger.warn(`Skill ${skillName} not found`);
        return null;
      }

      // Skill content is markdown with instructions for Claude
      const skillPrompt = skill.content || '';
      const fullPrompt = additionalContext
        ? `${skillPrompt}\n\nContext: ${additionalContext}\n\nUser request: ${input}`
        : `${skillPrompt}\n\nUser request: ${input}`;

      logger.info(`Executing skill: ${skillName}`);
      return {
        skill: skillName,
        prompt: fullPrompt,
        content: skill.content,
      };
    } catch (error) {
      logger.error(`Error executing skill ${skillName}:`, error.message);
      throw error;
    }
  },

  getPlatformFromSkillName(skillName) {
    if (skillName.includes('linkedin')) return 'linkedin';
    if (skillName.includes('tiktok') || skillName.includes('tik-tok')) return 'tiktok';
    if (skillName.includes('instagram') || skillName.includes('ig')) return 'instagram';
    if (skillName.includes('youtube')) return 'youtube';
    if (skillName.includes('facebook')) return 'facebook';
    if (skillName.includes('voice')) return 'general';
    return 'general';
  },

  async loadAllSkillsFromDirectory() {
    try {
      const files = await fs.readdir(SKILLS_DIR);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      logger.info(`Found ${mdFiles.length} skill files`);
      return mdFiles.map((f) => f.replace('.md', ''));
    } catch (error) {
      logger.warn('Could not load skills from directory:', error.message);
      return [];
    }
  },
};

export default skillService;
