import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [contentRes, adsRes, roiRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/content', { data: { userId: 1 } }),
        axios.get('http://localhost:5000/api/analytics/ads', { data: { userId: 1 } }),
        axios.get('http://localhost:5000/api/analytics/roi', { data: { userId: 1 } }),
      ]);

      setAnalytics({
        content: contentRes.data,
        ads: adsRes.data,
        roi: roiRes.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

      {loading ? (
        <p>Loading analytics...</p>
      ) : analytics ? (
        <div>
          {/* ROI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Ad Spend</h3>
              <p className="text-3xl font-bold text-gray-900">${analytics.roi.totalSpend}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">${analytics.roi.totalRevenue}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">ROI</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.roi.roi}%</p>
            </div>
          </div>

          {/* Content Analytics */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Content Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Platform</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analytics.content?.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-gray-900">{item.title}</td>
                      <td className="px-4 py-2 text-gray-600 capitalize">{item.platform}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ad Campaigns */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Campaign</th>
                    <th className="px-4 py-2 text-left">Platform</th>
                    <th className="px-4 py-2 text-left">Budget</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analytics.ads?.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 text-gray-600 capitalize">{item.platform}</td>
                      <td className="px-4 py-2 text-gray-900">${item.budget}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
