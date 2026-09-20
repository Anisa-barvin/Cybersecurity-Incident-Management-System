import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const colors = {
    'Open': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Under Investigation': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Resolved': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Closed': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {status}
    </span>
  );
};

const SeverityBadge = ({ severity }) => {
  const colors = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500'
  };
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${colors[severity]}`}></span>
  );
};

const Incidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, limit: 10 });

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      if (search) params.append('search', search);
      if (severityFilter !== 'All') params.append('severity', severityFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const response = await api.get(`/incidents/?${params.toString()}`);
      setIncidents(response.data.data);
      setPagination(prev => ({
        ...prev,
        total_pages: response.data.total_pages,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error fetching incidents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [pagination.page, severityFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchIncidents();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await api.delete(`/incidents/${id}`);
        fetchIncidents();
      } catch (error) {
        console.error('Error deleting incident', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Incident Registry</h1>
        <Link to="/report" className="px-4 py-2 bg-cyber-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          + Report Incident
        </Link>
      </div>

      <div className="bg-navy-800 p-4 rounded-xl border border-navy-700 shadow-lg flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search incidents..."
            className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-1 focus:ring-cyber-blue focus:border-cyber-blue"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="flex gap-4">
          <select 
            value={severityFilter} 
            onChange={(e) => { setSeverityFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
            className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
            className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type & Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Affected System</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reported Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">Loading incidents...</td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">No incidents found</td></tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.incident_id} className="hover:bg-navy-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cyber-blue">
                      {incident.incident_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SeverityBadge severity={incident.severity} />
                        <span className="text-sm text-white">{incident.incident_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {incident.affected_system}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(incident.reported_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/incidents/${incident.incident_id}`} className="text-gray-400 hover:text-cyber-blue mx-2">
                        <Eye className="inline h-5 w-5" />
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(incident.incident_id)} className="text-gray-400 hover:text-red-500 mx-2">
                          <Trash2 className="inline h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-navy-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.total_pages} (Total: {pagination.total || 0})
          </div>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1 bg-navy-900 border border-navy-700 rounded text-gray-300 disabled:opacity-50 hover:bg-navy-700"
            >
              Prev
            </button>
            <button 
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1 bg-navy-900 border border-navy-700 rounded text-gray-300 disabled:opacity-50 hover:bg-navy-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Incidents;
