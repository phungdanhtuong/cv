import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { teamAPI } from '../utils/api';

export default function TeamCollaboration() {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [inviteForm, setInviteForm] = useState({
    teamId: '',
    email: '',
    role: 'editor',
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchTeams();
    }
  }, [user?.id, isAuthenticated]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getUserTeams(user.id);
      setTeams(data.teams || []);
    } catch (err) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.invite({
        teamId: inviteForm.teamId,
        invitedByUserId: user.id,
        email: inviteForm.email,
        role: inviteForm.role,
      });

      setSuccess('Invitation sent!');
      setInviteForm({ teamId: '', email: '', role: 'editor' });
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to invite');
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center"><p className="text-gray-600">Please log in</p></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Collaboration</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invite Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h3>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                value={inviteForm.teamId}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, teamId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name || team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="approver">Approver</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Send Invite
            </button>
          </form>
        </div>

        {/* Teams List */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Teams</h3>

          {loading ? (
            <p className="text-center py-8">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-gray-500">No teams yet</p>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{team.team_name || team.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Members</p>
                      <p className="font-bold text-gray-900">{team.member_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Your Role</p>
                      <p className="font-bold text-gray-900">{team.user_role || 'Member'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-bold text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
