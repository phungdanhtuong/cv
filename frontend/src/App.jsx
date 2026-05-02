import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ContentCreator from './pages/ContentCreator';
import AdsManager from './pages/AdsManager';
import Analytics from './pages/Analytics';
import AgentSelector from './pages/AgentSelector';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import './index.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page content */}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/content" element={<ContentCreator />} />
              <Route path="/ads" element={<AdsManager />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/agents" element={<AgentSelector />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
