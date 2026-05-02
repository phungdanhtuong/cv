import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userId) {
      config.headers['X-User-ID'] = userId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ===== AGENTS =====
export const agentAPI = {
  getAll: () => apiClient.get('/agents'),
  getById: (id) => apiClient.get(`/agents/${id}`),
  execute: (id, payload) => apiClient.post(`/agents/${id}/execute`, payload),
};

// ===== CONTENT =====
export const contentAPI = {
  create: (data) => apiClient.post('/content/create', data),
  list: (userId) => apiClient.get('/content/list', { params: { userId } }),
  getById: (id) => apiClient.get(`/content/${id}`),
  approve: (id) => apiClient.post(`/content/${id}/approve`),
  reject: (id) => apiClient.post(`/content/${id}/reject`),
  delete: (id) => apiClient.delete(`/content/${id}`),
};

// ===== ADS =====
export const adsAPI = {
  createCampaign: (data) => apiClient.post('/ads/campaigns/create', data),
  listCampaigns: (userId) => apiClient.get('/ads/campaigns/list', { params: { userId } }),
  getMetrics: (campaignId) => apiClient.get(`/ads/campaigns/${campaignId}/metrics`),
  approveCampaign: (campaignId) => apiClient.post(`/ads/campaigns/${campaignId}/approve`),
  pauseCampaign: (campaignId) => apiClient.post(`/ads/campaigns/${campaignId}/pause`),
};

// ===== ANALYTICS =====
export const analyticsAPI = {
  getSummary: (userId) => apiClient.get('/analytics/summary', { params: { userId } }),
  getContent: (userId) => apiClient.get('/analytics/content', { params: { userId } }),
  getAds: (userId) => apiClient.get('/analytics/ads', { params: { userId } }),
  getROI: (userId) => apiClient.get('/analytics/roi', { params: { userId } }),
};

// ===== AGENT MANAGEMENT (Phase 3) =====
export const agentManagementAPI = {
  enable: (agentId, userId) => apiClient.post(`/agent-management/enable/${agentId}`, { userId }),
  disable: (agentId, userId) => apiClient.post(`/agent-management/disable/${agentId}`, { userId }),
  toggle: (agentId, userId) => apiClient.post(`/agent-management/toggle/${agentId}`, { userId }),
  getEnabled: (userId) => apiClient.get('/agent-management/enabled', { params: { userId } }),
  getDisabled: (userId) => apiClient.get('/agent-management/disabled', { params: { userId } }),
  getAll: (userId) => apiClient.get('/agent-management/all', { params: { userId } }),
  createTeam: (data) => apiClient.post('/agent-management/teams', data),
  getTeams: (userId) => apiClient.get('/agent-management/teams', { params: { userId } }),
  switchTeam: (teamId, userId) => apiClient.post(`/agent-management/teams/${teamId}/switch`, { userId }),
  deleteTeam: (teamId, userId) => apiClient.delete(`/agent-management/teams/${teamId}`, { params: { userId } }),
  getStats: (userId, days = 30) => apiClient.get('/agent-management/stats', { params: { userId, days } }),
  getRecommendations: (userId, taskType) =>
    apiClient.get(`/agent-management/recommend/${taskType}`, { params: { userId } }),
};

// ===== AB TESTING (Phase 3) =====
export const abTestingAPI = {
  create: (data) => apiClient.post('/ab-tests/create', data),
  getTest: (testId) => apiClient.get(`/ab-tests/${testId}`),
  recordMetrics: (testId, variationId, metrics) =>
    apiClient.post(`/ab-tests/${testId}/metrics/${variationId}`, metrics),
  analyze: (testId) => apiClient.get(`/ab-tests/${testId}/analyze`),
  declareWinner: (testId, winner) => apiClient.post(`/ab-tests/${testId}/declare-winner`, { winner }),
  getActive: (campaignId) => apiClient.get(`/ab-tests/campaign/${campaignId}/active`),
  getHistory: (userId, limit = 20) => apiClient.get(`/ab-tests/user/${userId}/history`, { params: { limit } }),
  getStats: (userId) => apiClient.get(`/ab-tests/user/${userId}/stats`),
  createMultivariate: (data) => apiClient.post('/ab-tests/multivariate/create', data),
};

// ===== CONTENT CALENDAR (Phase 3) =====
export const calendarAPI = {
  addEvent: (data) => apiClient.post('/calendar/add', data),
  getRange: (userId, startDate, endDate) =>
    apiClient.get('/calendar/range', { params: { userId, startDate, endDate } }),
  getMonth: (userId, year, month) => apiClient.get(`/calendar/month/${userId}/${year}/${month}`),
  getWeek: (userId, weekStart) => apiClient.get(`/calendar/week/${userId}`, { params: { weekStart } }),
  reschedule: (scheduleId, scheduledTime) =>
    apiClient.post(`/calendar/reschedule/${scheduleId}`, { scheduledTime }),
  dragDrop: (scheduleId, scheduledTime, platforms) =>
    apiClient.post(`/calendar/drag-drop/${scheduleId}`, { scheduledTime, platforms }),
  delete: (scheduleId) => apiClient.delete(`/calendar/${scheduleId}`),
  getUpcoming: (userId, daysAhead = 30) =>
    apiClient.get(`/calendar/upcoming/${userId}`, { params: { daysAhead } }),
  getPast: (userId, daysBack = 30) => apiClient.get(`/calendar/past/${userId}`, { params: { daysBack } }),
  updateStatus: (scheduleId, status) => apiClient.post(`/calendar/${scheduleId}/status`, { status }),
  bulkReschedule: (scheduleIds, daysOffset) =>
    apiClient.post('/calendar/bulk/reschedule', { scheduleIds, daysOffset }),
  getAnalytics: (userId, startDate, endDate) =>
    apiClient.get(`/calendar/analytics/${userId}`, { params: { startDate, endDate } }),
};

// ===== TEAM COLLABORATION (Phase 3) =====
export const teamAPI = {
  create: (data) => apiClient.post('/team/create', data),
  invite: (data) => apiClient.post('/team/invite', data),
  acceptInvitation: (invitationId, userId) =>
    apiClient.post(`/team/invitation/${invitationId}/accept`, { userId }),
  updateRole: (userId, teamId, newRole) =>
    apiClient.post(`/team/members/${userId}/role`, { teamId, newRole }),
  removeMember: (userId, teamId) => apiClient.delete(`/team/members/${userId}`, { params: { teamId } }),
  getMembers: (teamId) => apiClient.get(`/team/${teamId}/members`),
  getUserTeams: (userId) => apiClient.get(`/team/user/${userId}`),
  checkPermission: (teamId, userId, requiredPermission) =>
    apiClient.get(`/team/${teamId}/permission/${userId}`, { params: { requiredPermission } }),
  assignContent: (data) => apiClient.post('/team/content/assign', data),
  getAssignments: (teamId, userId) => apiClient.get(`/team/${teamId}/assignments/${userId}`),
  createWorkspace: (teamId, data) => apiClient.post(`/team/${teamId}/workspaces/create`, data),
  getWorkspaces: (teamId) => apiClient.get(`/team/${teamId}/workspaces`),
  getPendingInvitations: (teamId) => apiClient.get(`/team/${teamId}/invitations/pending`),
  deleteTeam: (teamId, userId) => apiClient.delete(`/team/${teamId}`, { params: { userId } }),
  getStats: (teamId) => apiClient.get(`/team/${teamId}/stats`),
};

// ===== DASHBOARD (Phase 3) =====
export const dashboardAPI = {
  getSummary: (userId) => apiClient.get(`/dashboard/summary/${userId}`),
  getCampaignMetrics: (userId, campaignId) =>
    apiClient.get(`/dashboard/campaign/${userId}/${campaignId}/metrics`),
  getContentMetrics: (userId, contentId) =>
    apiClient.get(`/dashboard/content/${userId}/${contentId}/metrics`),
  getAgentStatus: (userId, agentId) => apiClient.get(`/dashboard/agent/${userId}/${agentId}/status`),
  getAnalytics: (userId, startDate, endDate) =>
    apiClient.get(`/dashboard/analytics/${userId}`, { params: { startDate, endDate } }),
  getTeamActivity: (teamId, limit = 50) =>
    apiClient.get(`/dashboard/team/${teamId}/activity`, { params: { limit } }),
  getLiveStats: (userId) => apiClient.get(`/dashboard/live-stats/${userId}`),
};

export default apiClient;
