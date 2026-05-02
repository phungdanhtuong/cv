import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../utils/api';

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, isAuthenticated]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [contentRes, adsRes, roiRes] = await Promise.all([
        analyticsAPI.getContent(user.id),
        analyticsAPI.getAds(user.id),
        analyticsAPI.getROI(user.id),
      ]);

      setAnalytics({
        content: contentRes,
        ads: adsRes,
        roi: roiRes,
      });
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to view analytics</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
      <p className="text-gray-600 mb-8">Track your content and ad performance</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <p>Loading analytics...</p>
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* ROI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Ad Spend</h3>
              <p className="text-3xl font-bold text-gray-900">
                ${analytics.roi?.totalSpend?.toFixed(2) || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                ${analytics.roi?.totalRevenue?.toFixed(2) || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Estimated ROI</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.roi?.roi || 0}%</p>
            </div>
          </div>

          {/* Content Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Content Performance</h2>
            {analytics.content?.data && analytics.content.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Platform</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Impressions</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.content.data.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{item.title || `Content ${idx + 1}`}</td>
                        <td className="py-3 px-4 text-gray-600">{item.platform || 'Multi'}</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {item.impressions?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600">
                          {item.engagement?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No content data available</p>
            )}
          </div>

          {/* Ad Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ad Campaign Performance</h2>
            {analytics.ads?.data && analytics.ads.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Platform</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Spend</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Clicks</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Conversions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.ads.data.map((campaign, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{campaign.name || `Campaign ${idx + 1}`}</td>
                        <td className="py-3 px-4 text-gray-600">{campaign.platform}</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          ${campaign.spend?.toFixed(2) || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600">
                          {campaign.clicks?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600">
                          {campaign.conversions?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No ad data available</p>
            )}
          </div>
        </div>
      ) : (
        <p>No analytics data</p>
      )}
    </div>
  );
}
