import React, { useState } from 'react';
import axios from 'axios';

export default function ContentCreator() {
  const [formData, setFormData] = useState({
    description: '',
    platforms: [],
    contentType: 'text',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const platforms = ['linkedin', 'tiktok', 'instagram', 'youtube', 'facebook'];

  const handlePlatformToggle = (platform) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/content/create', {
        userId: 1,
        ...formData,
      });

      setResult(response.data);
      setFormData({ description: '', platforms: [], contentType: 'text' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Content</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to create?
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., 'A LinkedIn post about AI trends' or 'TikTok content about our new product'"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            {/* Content Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={formData.contentType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contentType: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text/Caption</option>
                <option value="video">Video Script</option>
                <option value="visual">Visual Direction</option>
              </select>
            </div>

            {/* Platforms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Platforms
              </label>
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <label key={platform} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                      className="rounded"
                    />
                    <span className="ml-2 text-gray-700 capitalize">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Content'}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Preview</h2>

            {formData.platforms.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Selected platforms:</p>
                <div className="space-y-2">
                  {formData.platforms.map((p) => (
                    <div key={p} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Content</h2>

          {/* Strategy */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Strategy</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{result.strategy}</p>
          </div>

          {/* Platform-specific content */}
          {Object.entries(result.content).map(([platform, content]) => (
            <div key={platform} className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold text-gray-900 mb-2 capitalize">{platform}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
            </div>
          ))}

          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Publish Content
          </button>
        </div>
      )}
    </div>
  );
}
