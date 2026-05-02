import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ open }) {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/content', label: 'Create Content', icon: '✍️' },
    { path: '/ads', label: 'Ad Campaigns', icon: '💰' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/agents', label: 'AI Agents', icon: '🤖' },
  ];

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 ${
        open ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">doAn Web1</h1>
        <p className="text-gray-400 text-sm mt-1">AI Agents Platform</p>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="text-xs text-gray-400 space-y-1">
          <p>© 2026 doAn Web1</p>
          <p>AI-Powered Content & Ads</p>
        </div>
      </div>
    </aside>
  );
}
