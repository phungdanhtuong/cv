import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { contentAPI } from '../utils/api';

export default function ContentCreator() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platforms: [],
    contentType: 'text',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const platforms = ['linkedin', 'tiktok', 'instagram', 'youtube', 'facebook'];
  const contentTypes = ['text', 'image', 'video', 'carousel', 'story'];

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
    setSuccess(null);

    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error('Title and description are required');
      }

      if (formData.platforms.length === 0) {
        throw new Error('Select at least one platform');
      }

      const response = await contentAPI.create({
        userId: user.id,
        ...formData,
      });

      setResult(response);
      setSuccess('Content created successfully!');
      setFormData({ title: '', description: '', platforms: [], contentType: 'text' });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to create content</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Content</h1>
      <p className="text-gray-600 mb-8">Generate AI-powered content for your social media</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., AI Revolution in 2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your content idea in detail..."
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
              <div className="flex gap-3 flex-wrap">
                {contentTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="contentType"
                      value={type}
                      checked={formData.contentType === type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contentType: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Platforms</label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`px-4 py-2 rounded-lg transition capitalize ${
                      formData.platforms.includes(platform)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              {formData.platforms.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">Selected: {formData.platforms.join(', ')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium transition"
            >
              {loading ? 'Creating...' : 'Create Content'}
            </button>
          </form>
        </div>

        {/* Preview/Result */}
        <div>
          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Generated Content</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Title</p>
                  <p className="text-gray-900">{result.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Content</p>
                  <p className="text-gray-700 text-sm line-clamp-4">{result.content}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Platforms</p>
                  <p className="text-gray-700 text-sm">{result.platform}</p>
                </div>
                <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Approve & Publish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
