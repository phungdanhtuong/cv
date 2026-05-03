import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContentCreator from './pages/ContentCreator';
import AdsManager from './pages/AdsManager';
import Analytics from './pages/Analytics';
import AgentSelector from './pages/AgentSelector';
import AgentManagement from './pages/AgentManagement';
import ABTestingDashboard from './pages/ABTestingDashboard';
import ContentCalendar from './pages/ContentCalendar';
import TeamCollaboration from './pages/TeamCollaboration';
import RealtimeDashboard from './pages/RealtimeDashboard';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import './index.css';

function ProtectedRoute({ element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar open={sidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
              <Route path="/content" element={<ProtectedRoute element={<ContentCreator />} />} />
              <Route path="/ads" element={<ProtectedRoute element={<AdsManager />} />} />
              <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
              <Route path="/agents" element={<ProtectedRoute element={<AgentSelector />} />} />
              <Route path="/agent-management" element={<ProtectedRoute element={<AgentManagement />} />} />
              <Route path="/ab-testing" element={<ProtectedRoute element={<ABTestingDashboard />} />} />
              <Route path="/content-calendar" element={<ProtectedRoute element={<ContentCalendar />} />} />
              <Route path="/team-collaboration" element={<ProtectedRoute element={<TeamCollaboration />} />} />
              <Route path="/realtime" element={<ProtectedRoute element={<RealtimeDashboard />} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
