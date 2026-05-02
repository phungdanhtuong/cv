import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { abTestingAPI } from '../utils/api';

export default function ABTestingDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('create');
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [createForm, setCreateForm] = useState({
    campaignId: '',
    variationAId: '',
    variationBId: '',
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [user?.id, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsRes, statsRes] = await Promise.all([
        abTestingAPI.getHistory(user.id, 20),
        abTestingAPI.getStats(user.id),
      ]);

      setTests(testsRes.tests || []);
      setStats(statsRes.stats);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await abTestingAPI.create({
        userId: user.id,
        ...createForm,
      });

      setSuccess('Test created successfully!');
      setCreateForm({ campaignId: '', variationAId: '', variationBId: '' });
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create test');
    }
  };

  const handleAnalyzeTest = async (testId) => {
    try {
      const analysis = await abTestingAPI.analyze(testId);
      setSuccess(`Winner: ${analysis.comparison?.winner} (${analysis.comparison?.confidence})`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to analyze');
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center"><p className="text-gray-600">Please log in</p></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Testing</h1>
      <p className="text-gray-600 mb-8">Create and analyze tests for content and campaigns</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Tests</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTests}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active Tests</p>
            <p className="text-3xl font-bold text-blue-600">{stats.activeTests}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed Tests</p>
            <p className="text-3xl font-bold text-green-600">{stats.completedTests}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Improvement</p>
            <p className="text-3xl font-bold text-purple-600">{stats.averageImprovement}</p>
          </div>
        </div>
      )}

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
          Create Test
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Test History
        </button>
      </div>

      {/* Create Tab */}
      {tab === 'create' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleCreateTest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign ID</label>
                <input
                  type="text"
                  value={createForm.campaignId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, campaignId: e.target.value }))}
                  placeholder="Enter campaign ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variation A ID</label>
                <input
                  type="text"
                  value={createForm.variationAId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, variationAId: e.target.value }))}
                  placeholder="Content/ad ID A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variation B ID</label>
                <input
                  type="text"
                  value={createForm.variationBId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, variationBId: e.target.value }))}
                  placeholder="Content/ad ID B"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
              Create A/B Test
            </button>
          </form>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          {loading ? (
            <p className="text-center py-8">Loading tests...</p>
          ) : tests.length === 0 ? (
            <p className="text-gray-500">No tests yet. Create your first test!</p>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Test #{test.id}</h4>
                      <p className="text-sm text-gray-600">Campaign: {test.campaign_id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        test.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Variation A</p>
                      <p className="text-sm font-medium text-gray-900">{test.variation_a_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variation B</p>
                      <p className="text-sm font-medium text-gray-900">{test.variation_b_id}</p>
                    </div>
                  </div>

                  {test.status === 'completed' && test.winner && (
                    <p className="text-sm text-green-600 mb-4">🏆 Winner: Variation {test.winner}</p>
                  )}

                  <button
                    onClick={() => handleAnalyzeTest(test.id)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  >
                    Analyze Results
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
