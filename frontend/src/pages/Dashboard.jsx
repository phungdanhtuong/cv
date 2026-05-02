import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, analyticsAPI } from '../utils/api';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const summaryData = await dashboardAPI.getSummary(user.id);
      setSummary(summaryData.data);

      const analyticsData = await analyticsAPI.getSummary(user.id);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.email || 'User'}!</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      ) : (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Content stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Content</h3>
              <p className="text-3xl font-bold text-gray-900">{summary?.content?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {summary?.content?.published || 0} published
              </p>
            </div>

            {/* Draft stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
              <p className="text-3xl font-bold text-yellow-600">{summary?.content?.draft || 0}</p>
            </div>

            {/* Campaigns stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Ad Campaigns</h3>
              <p className="text-3xl font-bold text-blue-600">{summary?.campaigns?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {summary?.campaigns?.active || 0} active
              </p>
            </div>

            {/* Budget stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${summary?.campaigns?.total_budget || 0}
              </p>
            </div>
          </div>

          {/* Scheduled Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Scheduled Content</h3>
              <p className="text-3xl font-bold text-gray-900">
                {summary?.scheduledContent?.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {summary?.scheduledContent?.upcoming_week || 0} this week
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-lg font-bold text-gray-900">
                {summary?.timestamp ? new Date(summary.timestamp).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/content"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
              >
                Create Content
              </a>
              <a
                href="/ads"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center"
              >
                Create Campaign
              </a>
              <a
                href="/analytics"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-center"
              >
                View Analytics
              </a>
              <a
                href="/agents"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-center"
              >
                Select Agents
              </a>
            </div>
          </div>

          {/* Content by Platform */}
          {stats?.content && stats.content.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Content by Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.content.map((c) => (
                  <div key={c.platform} className="p-4 bg-gray-50 rounded">
                    <p className="font-semibold text-gray-900 capitalize">{c.platform}</p>
                    <p className="text-gray-500">{c.count} posts</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
