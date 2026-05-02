import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentAPI, agentManagementAPI } from '../utils/api';

export default function AgentSelector() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');

  const divisions = [
    'all',
    'engineering',
    'design',
    'marketing',
    'sales',
    'product',
    'customer_success',
    'leadership',
    'operations',
    'finance',
    'strategy',
    'data_science',
    'hr',
  ];

  const divisionLabels = {
    all: 'All Divisions',
    engineering: '🔧 Engineering',
    design: '🎨 Design',
    marketing: '📱 Marketing',
    sales: '💼 Sales',
    product: '🎯 Product',
    customer_success: '👥 Customer Success',
    leadership: '👑 Leadership',
    operations: '⚙️ Operations',
    finance: '💰 Finance',
    strategy: '📊 Strategy',
    data_science: '🤖 Data Science',
    hr: '🌟 HR & Culture',
  };

  const agentIcons = {
    engineering: '🔧',
    design: '🎨',
    marketing: '📱',
    sales: '💼',
    product: '🎯',
    customer_success: '👥',
    leadership: '👑',
    operations: '⚙️',
    finance: '💰',
    strategy: '📊',
    data_science: '🤖',
    hr: '🌟',
  };

  useEffect(() => {
    fetchAgents();
    fetchEnabledAgents();
  }, [user?.id]);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, selectedDivision]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await agentAPI.getAll();
      setAgents(data);
    } catch (err) {
      setError('Failed to load agents: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEnabledAgents = async () => {
    try {
      if (!user?.id) return;
      const data = await agentManagementAPI.getEnabled(user.id);
      setSelectedAgents(data.agents?.map((a) => a.id) || []);
    } catch (err) {
      console.error('Failed to fetch enabled agents:', err);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    // Filter by division
    if (selectedDivision !== 'all') {
      filtered = filtered.filter((agent) => agent.type === selectedDivision);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(term) ||
          agent.personality.toLowerCase().includes(term) ||
          agent.expertise.toLowerCase().includes(term)
      );
    }

    setFilteredAgents(filtered);
  };

  const toggleAgent = async (agentId) => {
    try {
      if (!user?.id) {
        setError('Please log in first');
        return;
      }

      const isSelected = selectedAgents.includes(agentId);

      if (isSelected) {
        await agentManagementAPI.disable(agentId, user.id);
        setSelectedAgents((prev) => prev.filter((id) => id !== agentId));
      } else {
        await agentManagementAPI.enable(agentId, user.id);
        setSelectedAgents((prev) => [...prev, agentId]);
      }
    } catch (err) {
      setError('Failed to update agent: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your AI Agents</h1>
      <p className="text-gray-600 mb-8">
        Choose which agents you want to use. Selected: <strong>{selectedAgents.length}</strong> agents
      </p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <p className="text-center py-8">Loading agents...</p>
      ) : (
        <div>
          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search agents by name, personality, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {divisions.map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedDivision === div
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {divisionLabels[div]}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-700">
              Showing <strong>{filteredAgents.length}</strong> of <strong>{agents.length}</strong> agents
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  selectedAgents.includes(agent.id)
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">{agentIcons[agent.type] || '🤖'}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{agent.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.personality}</p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  <strong>Skills:</strong> {agent.expertise}
                </p>
                {selectedAgents.includes(agent.id) && (
                  <div className="mt-3 text-sm text-blue-600 font-semibold">✓ Selected</div>
                )}
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No agents found matching your criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
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
