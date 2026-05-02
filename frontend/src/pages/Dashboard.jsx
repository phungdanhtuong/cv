import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/summary', {
        data: { userId: 1 }, // Mock user ID
      });
      setStats(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Content stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Content</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.content?.reduce((sum, c) => sum + c.count, 0) || 0}
              </p>
            </div>

            {/* Published stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Published</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats?.content?.reduce((sum, c) => sum + (c.published || 0), 0) || 0}
              </p>
            </div>

            {/* Campaigns stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Ad Campaigns</h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.ads?.reduce((sum, a) => sum + a.count, 0) || 0}
              </p>
            </div>

            {/* Spend stat */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Ad Spend</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${stats?.ads?.reduce((sum, a) => sum + (a.total_spend || 0), 0) || 0}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
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
