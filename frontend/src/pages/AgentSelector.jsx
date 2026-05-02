import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AgentSelector() {
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/agents');
      setAgents(response.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (agentId) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const agentIcons = {
    strategist: '🎯',
    creator: '✍️',
    'ads-manager': '💰',
    analytics: '📊',
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Select Your AI Agents</h1>
      <p className="text-gray-600 mb-8">Choose which agents you want to use for content and ad management</p>

      {loading ? (
        <p>Loading agents...</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  selectedAgents.includes(agent.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">{agentIcons[agent.type] || '🤖'}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{agent.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{agent.personality}</p>
                <p className="text-xs text-gray-500">
                  <strong>Expertise:</strong> {agent.expertise}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Summary */}
          {selectedAgents.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-3">Selected Agents ({selectedAgents.length})</h2>
              <div className="flex flex-wrap gap-2">
                {agents
                  .filter((a) => selectedAgents.includes(a.id))
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="px-4 py-2 bg-blue-200 text-blue-900 rounded-full flex items-center"
                    >
                      {agentIcons[agent.type]} {agent.name}
                    </div>
                  ))}
              </div>

              <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Save Agent Configuration
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
