import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentManagementAPI } from '../utils/api';

export default function AgentManagement() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('agents');
  const [enabledAgents, setEnabledAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Team creation form
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    agentIds: [],
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [user?.id, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enabledRes, allRes, teamsRes] = await Promise.all([
        agentManagementAPI.getEnabled(user.id),
        agentManagementAPI.getAll(user.id),
        agentManagementAPI.getTeams(user.id),
      ]);

      setEnabledAgents(enabledRes.agents || []);
      setAllAgents(allRes.agents || []);
      setTeams(teamsRes.teams || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (agentId) => {
    try {
      await agentManagementAPI.toggle(agentId, user.id);
      setSuccess('Agent toggled successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to toggle agent');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      if (!teamForm.name.trim()) {
        throw new Error('Team name is required');
      }

      await agentManagementAPI.createTeam({
        userId: user.id,
        teamConfig: {
          name: teamForm.name,
          description: teamForm.description,
          agentIds: teamForm.agentIds,
        },
      });

      setSuccess('Team created successfully!');
      setTeamForm({ name: '', description: '', agentIds: [] });
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create team');
    }
  };

  const handleSwitchTeam = async (teamId) => {
    try {
      await agentManagementAPI.switchTeam(teamId, user.id);
      setSuccess('Team switched successfully!');
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to switch team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await agentManagementAPI.deleteTeam(teamId, user.id);
      setSuccess('Team deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to delete team');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Agent Management</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('agents')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'agents'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Agents ({enabledAgents.length} enabled)
        </button>
        <button
          onClick={() => setTab('teams')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'teams'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Teams ({teams.length})
        </button>
      </div>

      {/* Agents Tab */}
      {tab === 'agents' && (
        <div>
          {loading ? (
            <p className="text-center py-8">Loading agents...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Enabled: <strong>{enabledAgents.length}</strong> / Total: <strong>{allAgents.length}</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAgents.map((agent) => {
                  const isEnabled = enabledAgents.some((a) => a.id === agent.id);

                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        isEnabled
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                        <span
                          className={`text-2xl ${isEnabled ? 'opacity-100' : 'opacity-50'}`}
                        >
                          {isEnabled ? '✅' : '⭕'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{agent.personality}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{agent.expertise}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Team Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Team</h3>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Content Team"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Agents</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allAgents.slice(0, 10).map((agent) => (
                    <label key={agent.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={teamForm.agentIds.includes(agent.id)}
                        onChange={(e) =>
                          setTeamForm((prev) => ({
                            ...prev,
                            agentIds: e.target.checked
                              ? [...prev.agentIds, agent.id]
                              : prev.agentIds.filter((id) => id !== agent.id),
                          }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">{agent.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Create Team
              </button>
            </form>
          </div>

          {/* Teams List */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Teams</h3>

            {teams.length === 0 ? (
              <p className="text-gray-500">No teams yet. Create your first team!</p>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{team.team_name}</h4>
                        {team.description && <p className="text-sm text-gray-600">{team.description}</p>}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          team.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {team.is_active ? '✓ Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                      {team.member_count || 0} members • {team.agent_ids?.length || 0} agents
                    </p>

                    <div className="flex gap-2">
                      {!team.is_active && (
                        <button
                          onClick={() => handleSwitchTeam(team.id)}
                          className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
