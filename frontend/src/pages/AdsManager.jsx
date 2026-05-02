import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adsAPI } from '../utils/api';

export default function AdsManager() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    budget: 100,
    platform: 'facebook',
    targetAudience: {
      ageMin: 18,
      ageMax: 65,
      interests: [],
    },
    duration: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [fetchingCampaigns, setFetchingCampaigns] = useState(false);

  const platforms = ['facebook', 'instagram', 'google', 'linkedin', 'tiktok'];

  useEffect(() => {
    if (tab === 'list' && isAuthenticated) {
      fetchCampaigns();
    }
  }, [tab, isAuthenticated]);

  const fetchCampaigns = async () => {
    try {
      setFetchingCampaigns(true);
      const data = await adsAPI.listCampaigns(user.id);
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError('Failed to load campaigns: ' + (err.message || 'Unknown error'));
    } finally {
      setFetchingCampaigns(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Campaign name is required');
      }

      if (formData.budget < 10) {
        throw new Error('Minimum budget is $10');
      }

      const response = await adsAPI.createCampaign({
        userId: user.id,
        ...formData,
      });

      setSuccess('Campaign created successfully!');
      setFormData({
        name: '',
        budget: 100,
        platform: 'facebook',
        targetAudience: { ageMin: 18, ageMax: 65, interests: [] },
        duration: 7,
      });

      setTimeout(() => {
        setSuccess(null);
        setTab('list');
        fetchCampaigns();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCampaign = async (campaignId) => {
    try {
      await adsAPI.approveCampaign(campaignId);
      setSuccess('Campaign approved!');
      fetchCampaigns();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to approve campaign: ' + (err.message || 'Unknown error'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to manage ads</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ad Campaign Manager</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('create')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create Campaign
        </button>
        <button
          onClick={() => setTab('list')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'list'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Campaigns
        </button>
      </div>

      {/* Create Tab */}
      {tab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Sale 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (USD)</label>
                <input
                  type="number"
                  min="10"
                  value={formData.budget}
                  onChange={(e) => setFormData((prev) => ({ ...prev, budget: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Age Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Age</label>
                  <input
                    type="number"
                    min="13"
                    value={formData.targetAudience.ageMin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetAudience: { ...prev.targetAudience, ageMin: parseInt(e.target.value) },
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Age</label>
                  <input
                    type="number"
                    max="120"
                    value={formData.targetAudience.ageMax}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetAudience: { ...prev.targetAudience, ageMax: parseInt(e.target.value) },
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium transition"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Tips</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✓ Start with a realistic budget (minimum $10)</li>
              <li>✓ Target specific age groups for better ROI</li>
              <li>✓ Run campaigns for at least 7 days</li>
              <li>✓ Use clear, compelling campaign names</li>
              <li>✓ Monitor performance daily</li>
            </ul>
          </div>
        </div>
      )}

      {/* List Tab */}
      {tab === 'list' && (
        <div>
          {fetchingCampaigns ? (
            <p className="text-center py-8">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600">No campaigns yet. Create your first campaign!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.platform} • ${campaign.budget} budget
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApproveCampaign(campaign.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
