import React, { useState } from 'react';
import axios from 'axios';

export default function AdsManager() {
  const [tab, setTab] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    contentId: '',
    budget: 100,
    platform: 'facebook',
    targetAudience: {
      geoLocations: { regions: [] },
      ageMin: 18,
      ageMax: 65,
      interests: [],
    },
    duration: 7,
    adAccountId: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ads/campaigns/create', {
        userId: 1,
        ...formData,
      });

      setResult(response.data);
      setFormData({
        name: '',
        contentId: '',
        budget: 100,
        platform: 'facebook',
        targetAudience: {
          geoLocations: { regions: [] },
          ageMin: 18,
          ageMax: 65,
          interests: [],
        },
        duration: 7,
        adAccountId: 1,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ads/campaigns/list', {
        data: { userId: 1 },
      });
      setCampaigns(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ad Campaigns</h1>

      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          onClick={() => {
            setTab('create');
            setResult(null);
          }}
          className={`px-4 py-2 font-medium ${
            tab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Create Campaign
        </button>
        <button
          onClick={() => {
            setTab('campaigns');
            fetchCampaigns();
          }}
          className={`px-4 py-2 font-medium ${
            tab === 'campaigns'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Campaigns
        </button>
      </div>

      {tab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              {/* Campaign Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 'Summer Sale Campaign'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (USD)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, budget: parseFloat(e.target.value) }))
                    }
                    className="flex-1"
                  />
                  <span className="ml-4 text-lg font-bold text-gray-900">${formData.budget}</span>
                </div>
              </div>

              {/* Platform */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, platform: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google Ads</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              {/* Age Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Age Range
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={formData.targetAudience.ageMin}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetAudience: {
                            ...prev.targetAudience,
                            ageMin: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Min age"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={formData.targetAudience.ageMax}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetAudience: {
                            ...prev.targetAudience,
                            ageMax: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Max age"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error */}
              {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Campaign Summary</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p className="text-2xl font-bold text-green-600">${formData.budget}</p>
                </div>
                <div>
                  <p className="text-gray-500">Daily Budget</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${(formData.budget / formData.duration).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.duration} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Campaigns List */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No campaigns yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{campaign.platform}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">${campaign.budget}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-green-900 mb-3">Campaign Created Successfully!</h2>
          <p className="text-green-700 mb-4">Campaign ID: {result.campaignId}</p>
          <div className="p-4 bg-white rounded mb-4">
            <p className="text-sm text-gray-600 mb-2">Strategy:</p>
            <p className="text-gray-900">{result.strategy}</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Review & Launch Campaign
          </button>
        </div>
      )}
    </div>
  );
}
