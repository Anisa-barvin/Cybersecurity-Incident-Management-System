import React, { useState, useEffect } from 'react';
import { Activity, Search } from 'lucide-react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, limit: 20 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/audit-logs/?page=${pagination.page}&limit=${pagination.limit}`);
      setLogs(response.data.data);
      setPagination(prev => ({
        ...prev,
        total_pages: response.data.total_pages,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error fetching audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
        <Activity className="text-cyber-green h-6 w-6" />
      </div>

      <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-navy-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cyber-blue">
                      {log.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded bg-navy-900 border border-navy-700 text-gray-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.resource}: <span className="font-mono text-xs">{log.resource_id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {Object.keys(log.details || {}).length > 0 ? (
                        <pre className="text-xs bg-navy-900 p-2 rounded max-w-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : '-'}
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

export default AuditLogs;
