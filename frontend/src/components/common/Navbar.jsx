import React from 'react';

export default function Navbar({ onMenuClick }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="mr-4 text-gray-600 hover:text-gray-900">
          ☰
        </button>
        <h2 className="text-xl font-bold text-gray-900">AI Social Media Agents</h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-gray-900">🔔</button>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          U
        </div>
      </div>
    </nav>
  );
}
