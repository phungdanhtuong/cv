import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RealtimeDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    contentCreatedToday: 0,
    activeCampaigns: 0,
    totalEngagement: 0,
    avgResponseTime: 0,
    systemHealth: 100,
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [events, setEvents] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/realtime?userId=${user.id}`;

    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      setConnectionStatus('connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'metrics') {
          setMetrics(data.payload);
        } else if (data.type === 'event') {
          setEvents((prev) => [
            { id: Date.now(), timestamp: new Date(), ...data.payload },
            ...prev.slice(0, 49),
          ]);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    websocket.onerror = () => {
      setConnectionStatus('error');
    };

    websocket.onclose = () => {
      setConnectionStatus('disconnected');
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [user?.id, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in</p>
      </div>
    );
  }

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthColor = () => {
    if (metrics.systemHealth >= 80) return 'text-green-600';
    if (metrics.systemHealth >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Real-Time Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${getConnectionColor()}`}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Active Agents</p>
          <p className="text-4xl font-bold text-blue-600">{metrics.activeAgents}</p>
          <p className="text-xs text-gray-500 mt-2">Working on tasks</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Content Created Today</p>
          <p className="text-4xl font-bold text-green-600">{metrics.contentCreatedToday}</p>
          <p className="text-xs text-gray-500 mt-2">Pieces generated</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Active Campaigns</p>
          <p className="text-4xl font-bold text-purple-600">{metrics.activeCampaigns}</p>
          <p className="text-xs text-gray-500 mt-2">Running ads</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Engagement</p>
          <p className="text-4xl font-bold text-orange-600">
            {(metrics.totalEngagement / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-gray-500 mt-2">Interactions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Response Time</p>
          <p className="text-4xl font-bold text-indigo-600">{metrics.avgResponseTime}ms</p>
          <p className="text-xs text-gray-500 mt-2">Agent latency</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">System Health</p>
          <p className={`text-4xl font-bold ${getHealthColor()}`}>{metrics.systemHealth}%</p>
          <p className="text-xs text-gray-500 mt-2">Overall status</p>
        </div>
      </div>

      {/* Live Events Feed */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Live Events Feed</h2>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Waiting for events...</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {event.metadata && (
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
        <p>
          <strong>User ID:</strong> {user?.id}
        </p>
        <p>
          <strong>Connection Status:</strong> {connectionStatus}
        </p>
        <p>
          <strong>Last Update:</strong> {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
