import { extractUserId } from '../middleware/auth.js';
import express from 'express';
import teamCollaborationService from '../services/teamCollaborationService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
router.use(extractUserId);

// Create team
router.post('/create', async (req, res) => {
  try {
    const { userId, teamName, description } = req.body;

    if (!userId || !teamName) {
      return res.status(400).json({ error: 'userId and teamName are required' });
    }

    const result = await teamCollaborationService.createTeam(userId, teamName, description);

    res.status(201).json({
      success: true,
      team: result,
    });
  } catch (error) {
    logger.error('Create team error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Invite team member
router.post('/invite', async (req, res) => {
  try {
    const { teamId, invitedByUserId, email, role } = req.body;

    if (!teamId || !invitedByUserId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await teamCollaborationService.inviteTeamMember(
      teamId,
      invitedByUserId,
      email,
      role
    );

    res.status(201).json({
      success: true,
      invitation: result,
    });
  } catch (error) {
    logger.error('Invite member error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation
router.post('/invitation/:invitationId/accept', async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await teamCollaborationService.acceptInvitation(invitationId, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Accept invitation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update member role
router.post('/members/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { teamId, newRole } = req.body;

    if (!teamId || !newRole) {
      return res.status(400).json({ error: 'teamId and newRole are required' });
    }

    const result = await teamCollaborationService.updateMemberRole(teamId, userId, newRole);

    res.json({
      success: true,
      member: result,
    });
  } catch (error) {
    logger.error('Update role error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Remove team member
router.delete('/members/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const result = await teamCollaborationService.removeTeamMember(teamId, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Remove member error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get team members
router.get('/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const members = await teamCollaborationService.getTeamMembers(teamId);

    res.json({
      success: true,
      members,
      count: members.length,
    });
  } catch (error) {
    logger.error('Get members error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user's teams
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const teams = await teamCollaborationService.getUserTeams(userId);

    res.json({
      success: true,
      teams,
      count: teams.length,
    });
  } catch (error) {
    logger.error('Get user teams error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Check permission
router.get('/:teamId/permission/:userId', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { requiredPermission } = req.query;

    if (!requiredPermission) {
      return res.status(400).json({ error: 'requiredPermission is required' });
    }

    const hasPermission = await teamCollaborationService.checkPermission(
      teamId,
      userId,
      requiredPermission
    );

    res.json({
      success: true,
      hasPermission,
    });
  } catch (error) {
    logger.error('Check permission error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Assign content
router.post('/content/assign', async (req, res) => {
  try {
    const { contentId, teamId, assignedToUserId, assignedByUserId } = req.body;

    if (!contentId || !teamId || !assignedToUserId || !assignedByUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await teamCollaborationService.assignContent(
      contentId,
      teamId,
      assignedToUserId,
      assignedByUserId
    );

    res.json({
      success: true,
      assignment: result,
    });
  } catch (error) {
    logger.error('Assign content error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get content assignments
router.get('/:teamId/assignments/:userId', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const assignments = await teamCollaborationService.getContentAssignments(teamId, userId);

    res.json({
      success: true,
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    logger.error('Get assignments error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create workspace
router.post('/:teamId/workspaces/create', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { workspaceName, description } = req.body;

    if (!workspaceName) {
      return res.status(400).json({ error: 'workspaceName is required' });
    }

    const result = await teamCollaborationService.createWorkspace(
      teamId,
      workspaceName,
      description
    );

    res.status(201).json({
      success: true,
      workspace: result,
    });
  } catch (error) {
    logger.error('Create workspace error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get workspaces
router.get('/:teamId/workspaces', async (req, res) => {
  try {
    const { teamId } = req.params;
    const workspaces = await teamCollaborationService.getTeamWorkspaces(teamId);

    res.json({
      success: true,
      workspaces,
      count: workspaces.length,
    });
  } catch (error) {
    logger.error('Get workspaces error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get pending invitations
router.get('/:teamId/invitations/pending', async (req, res) => {
  try {
    const { teamId } = req.params;
    const invitations = await teamCollaborationService.getPendingInvitations(teamId);

    res.json({
      success: true,
      invitations,
      count: invitations.length,
    });
  } catch (error) {
    logger.error('Get pending invitations error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete team
router.delete('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await teamCollaborationService.deleteTeam(teamId, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Delete team error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get collaboration stats
router.get('/:teamId/stats', async (req, res) => {
  try {
    const { teamId } = req.params;
    const stats = await teamCollaborationService.getCollaborationStats(teamId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Get stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
