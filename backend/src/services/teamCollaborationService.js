import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

export const teamCollaborationService = {
  // Create team
  async createTeam(userId, teamName, description) {
    try {
      logger.info(`Creating team: ${teamName}`);

      const result = await pool.query(
        `INSERT INTO teams (owner_id, name, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, teamName, description]
      );

      const teamId = result.rows[0].id;

      // Add owner as team member
      await pool.query(
        `INSERT INTO team_members (team_id, user_id, role, permissions)
         VALUES ($1, $2, 'admin', $3)`,
        [teamId, userId, JSON.stringify(['create', 'read', 'update', 'delete', 'manage_team'])]
      );

      logger.info(`✓ Team created: ${teamId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Create team failed:', error.message);
      throw error;
    }
  },

  // Invite team member
  async inviteTeamMember(teamId, invitedByUserId, email, role = 'editor') {
    try {
      logger.info(`Inviting ${email} to team ${teamId} as ${role}`);

      // Define permissions by role
      const rolePermissions = {
        admin: ['create', 'read', 'update', 'delete', 'manage_team'],
        editor: ['create', 'read', 'update', 'delete'],
        viewer: ['read'],
        approver: ['read', 'update'],
        manager: ['create', 'read', 'update', 'delete', 'manage_members'],
      };

      const permissions = rolePermissions[role] || rolePermissions.editor;

      const result = await pool.query(
        `INSERT INTO team_invitations (team_id, invited_by, email, role, permissions, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [teamId, invitedByUserId, email, role, JSON.stringify(permissions)]
      );

      logger.info(`✓ Invitation sent to ${email}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Invite team member failed:', error.message);
      throw error;
    }
  },

  // Accept team invitation
  async acceptInvitation(invitationId, userId) {
    try {
      logger.info(`Accepting invitation ${invitationId}`);

      // Get invitation
      const invitation = await pool.query(
        'SELECT * FROM team_invitations WHERE id = $1',
        [invitationId]
      );

      if (invitation.rows.length === 0) {
        throw new Error('Invitation not found');
      }

      const inv = invitation.rows[0];

      // Add user to team
      await pool.query(
        `INSERT INTO team_members (team_id, user_id, role, permissions)
         VALUES ($1, $2, $3, $4)`,
        [inv.team_id, userId, inv.role, inv.permissions]
      );

      // Mark invitation as accepted
      await pool.query(
        `UPDATE team_invitations SET status = 'accepted' WHERE id = $1`,
        [invitationId]
      );

      logger.info(`✓ Invitation accepted`);
      return { success: true };
    } catch (error) {
      logger.error('Accept invitation failed:', error.message);
      throw error;
    }
  },

  // Update team member role
  async updateMemberRole(teamId, userId, newRole) {
    try {
      logger.info(`Updating role for user ${userId} in team ${teamId}`);

      const rolePermissions = {
        admin: ['create', 'read', 'update', 'delete', 'manage_team'],
        editor: ['create', 'read', 'update', 'delete'],
        viewer: ['read'],
        approver: ['read', 'update'],
        manager: ['create', 'read', 'update', 'delete', 'manage_members'],
      };

      const permissions = rolePermissions[newRole] || rolePermissions.editor;

      const result = await pool.query(
        `UPDATE team_members
         SET role = $1, permissions = $2, updated_at = CURRENT_TIMESTAMP
         WHERE team_id = $3 AND user_id = $4
         RETURNING *`,
        [newRole, JSON.stringify(permissions), teamId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Team member not found');
      }

      logger.info(`✓ Role updated to ${newRole}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Update role failed:', error.message);
      throw error;
    }
  },

  // Remove team member
  async removeTeamMember(teamId, userId) {
    try {
      logger.info(`Removing user ${userId} from team ${teamId}`);

      const result = await pool.query(
        `DELETE FROM team_members
         WHERE team_id = $1 AND user_id = $2
         RETURNING user_id`,
        [teamId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Team member not found');
      }

      logger.info(`✓ Team member removed`);
      return { removed: true };
    } catch (error) {
      logger.error('Remove team member failed:', error.message);
      throw error;
    }
  },

  // Get team members
  async getTeamMembers(teamId) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.email, u.name, tm.role, tm.permissions, tm.created_at
         FROM team_members tm
         JOIN users u ON tm.user_id = u.id
         WHERE tm.team_id = $1
         ORDER BY tm.role DESC, u.name`,
        [teamId]
      );

      return result.rows.map((row) => ({
        ...row,
        permissions: JSON.parse(row.permissions),
      }));
    } catch (error) {
      logger.error('Get team members failed:', error.message);
      throw error;
    }
  },

  // Get user's teams
  async getUserTeams(userId) {
    try {
      const result = await pool.query(
        `SELECT t.*,
                COUNT(DISTINCT tm.user_id) as member_count,
                tm.role as user_role
         FROM teams t
         JOIN team_members tm ON t.id = tm.team_id
         WHERE tm.user_id = $1
         GROUP BY t.id, tm.role
         ORDER BY t.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get user teams failed:', error.message);
      throw error;
    }
  },

  // Check permission
  async checkPermission(teamId, userId, requiredPermission) {
    try {
      const result = await pool.query(
        `SELECT permissions FROM team_members
         WHERE team_id = $1 AND user_id = $2`,
        [teamId, userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const permissions = JSON.parse(result.rows[0].permissions);
      return permissions.includes(requiredPermission);
    } catch (error) {
      logger.error('Check permission failed:', error.message);
      return false;
    }
  },

  // Assign content to team member
  async assignContent(contentId, teamId, assignedToUserId, assignedByUserId) {
    try {
      logger.info(`Assigning content ${contentId} to user ${assignedToUserId}`);

      // Check permission
      const hasPermission = await this.checkPermission(teamId, assignedByUserId, 'manage_team');
      if (!hasPermission) {
        throw new Error('Not authorized to assign content');
      }

      const result = await pool.query(
        `INSERT INTO content_assignments (content_id, team_id, assigned_to, assigned_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (content_id) DO UPDATE
         SET assigned_to = $3, assigned_by = $4
         RETURNING *`,
        [contentId, teamId, assignedToUserId, assignedByUserId]
      );

      logger.info(`✓ Content assigned`);
      return result.rows[0];
    } catch (error) {
      logger.error('Assign content failed:', error.message);
      throw error;
    }
  },

  // Get content assignments
  async getContentAssignments(teamId, userId) {
    try {
      const result = await pool.query(
        `SELECT ca.*, c.title, u.email
         FROM content_assignments ca
         JOIN content c ON ca.content_id = c.id
         JOIN users u ON ca.assigned_to = u.id
         WHERE ca.team_id = $1
         AND (ca.assigned_to = $2 OR $2 = (SELECT owner_id FROM teams WHERE id = $1))
         ORDER BY ca.created_at DESC`,
        [teamId, userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get assignments failed:', error.message);
      throw error;
    }
  },

  // Create team workspace
  async createWorkspace(teamId, workspaceName, description) {
    try {
      logger.info(`Creating workspace: ${workspaceName}`);

      const result = await pool.query(
        `INSERT INTO team_workspaces (team_id, name, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [teamId, workspaceName, description]
      );

      logger.info(`✓ Workspace created: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Create workspace failed:', error.message);
      throw error;
    }
  },

  // Get team workspaces
  async getTeamWorkspaces(teamId) {
    try {
      const result = await pool.query(
        `SELECT * FROM team_workspaces WHERE team_id = $1 ORDER BY created_at DESC`,
        [teamId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get workspaces failed:', error.message);
      throw error;
    }
  },

  // Get pending invitations
  async getPendingInvitations(teamId) {
    try {
      const result = await pool.query(
        `SELECT * FROM team_invitations
         WHERE team_id = $1 AND status = 'pending'
         ORDER BY created_at DESC`,
        [teamId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Get pending invitations failed:', error.message);
      throw error;
    }
  },

  // Delete team
  async deleteTeam(teamId, userId) {
    try {
      logger.info(`Deleting team ${teamId}`);

      // Check ownership
      const team = await pool.query('SELECT owner_id FROM teams WHERE id = $1', [teamId]);

      if (team.rows.length === 0) {
        throw new Error('Team not found');
      }

      if (team.rows[0].owner_id !== userId) {
        throw new Error('Only team owner can delete team');
      }

      // Delete team members
      await pool.query('DELETE FROM team_members WHERE team_id = $1', [teamId]);

      // Delete invitations
      await pool.query('DELETE FROM team_invitations WHERE team_id = $1', [teamId]);

      // Delete workspaces
      await pool.query('DELETE FROM team_workspaces WHERE team_id = $1', [teamId]);

      // Delete team
      await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);

      logger.info(`✓ Team deleted: ${teamId}`);
      return { deleted: true };
    } catch (error) {
      logger.error('Delete team failed:', error.message);
      throw error;
    }
  },

  // Get collaboration stats
  async getCollaborationStats(teamId) {
    try {
      const membersResult = await pool.query(
        'SELECT COUNT(*) as count FROM team_members WHERE team_id = $1',
        [teamId]
      );

      const assignmentsResult = await pool.query(
        'SELECT COUNT(*) as count FROM content_assignments WHERE team_id = $1',
        [teamId]
      );

      const workspacesResult = await pool.query(
        'SELECT COUNT(*) as count FROM team_workspaces WHERE team_id = $1',
        [teamId]
      );

      return {
        totalMembers: parseInt(membersResult.rows[0].count),
        activeAssignments: parseInt(assignmentsResult.rows[0].count),
        workspaces: parseInt(workspacesResult.rows[0].count),
      };
    } catch (error) {
      logger.error('Get stats failed:', error.message);
      throw error;
    }
  },
};

export default teamCollaborationService;
