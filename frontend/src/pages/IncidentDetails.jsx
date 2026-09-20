import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, Server, AlertTriangle, Shield, CheckCircle, Plus } from 'lucide-react';
import api from '../services/api';

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [newAction, setNewAction] = useState('');

  const fetchIncident = async () => {
    try {
      const response = await api.get(`/incidents/${id}`);
      setIncident(response.data);
      setStatus(response.data.status);
      setSeverity(response.data.severity);
    } catch (error) {
      console.error('Error fetching incident', error);
      if (error.response?.status === 403) {
        navigate('/incidents');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const payload = {};
      if (status !== incident.status) payload.status = status;
      if (severity !== incident.severity) payload.severity = severity;
      if (newAction.trim()) payload.new_action = newAction.trim();
      
      if (Object.keys(payload).length > 0) {
        await api.put(`/incidents/${id}`, payload);
        setNewAction('');
        fetchIncident();
      }
    } catch (error) {
      console.error('Error updating incident', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-cyber-blue p-8">Loading details...</div>;
  if (!incident) return <div className="text-red-500 p-8">Incident not found.</div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center text-gray-400 hover:text-white cursor-pointer w-fit" onClick={() => navigate('/incidents')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
      </div>

      <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-navy-700 bg-navy-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {incident.incident_id} 
              <span className="text-sm font-normal px-2.5 py-1 rounded-full bg-navy-700 text-gray-300">
                {incident.incident_type}
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-2 flex items-center">
              <Clock className="mr-1.5 h-4 w-4" /> Reported on {new Date(incident.reported_date).toLocaleString()} by {incident.reported_by.username}
            </p>
          </div>
          
          {isAdmin ? (
            <div className="flex flex-col gap-2 bg-navy-900 p-3 rounded-lg border border-navy-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">Status</span>
                <select value={status} onChange={e => setStatus(e.target.value)} className="bg-navy-800 text-white text-sm rounded border border-navy-600 px-2 py-1 outline-none">
                  <option value="Open">Open</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">Severity</span>
                <select value={severity} onChange={e => setSeverity(e.target.value)} className="bg-navy-800 text-white text-sm rounded border border-navy-600 px-2 py-1 outline-none">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="font-semibold text-white">{incident.status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Severity</p>
                <p className="font-semibold text-white">{incident.severity}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-cyber-blue" /> Description
              </h3>
              <div className="bg-navy-900 p-4 rounded-lg border border-navy-700 text-gray-300 whitespace-pre-wrap">
                {incident.description}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-cyber-green" /> Actions Taken
              </h3>
              <div className="bg-navy-900 rounded-lg border border-navy-700 divide-y divide-navy-700">
                {incident.actions_taken.length === 0 ? (
                  <div className="p-4 text-gray-500 italic">No actions recorded yet.</div>
                ) : (
                  incident.actions_taken.map((action, idx) => (
                    <div key={idx} className="p-4 flex gap-4">
                      <div className="mt-1"><CheckCircle className="h-5 w-5 text-cyber-green" /></div>
                      <div>
                        <p className="text-white">{action.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          By {action.performed_by} • {new Date(action.performed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {isAdmin && (
                  <div className="p-4 bg-navy-800/50">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newAction} 
                        onChange={e => setNewAction(e.target.value)}
                        placeholder="Log a new action taken..."
                        className="flex-1 bg-navy-900 border border-navy-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyber-blue"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {(isAdmin && (status !== incident.status || severity !== incident.severity || newAction.trim())) && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex items-center px-4 py-2 bg-cyber-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {updating ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                <Server className="mr-2 h-5 w-5 text-cyber-blue" /> Affected System
              </h3>
              <div className="bg-navy-900 p-4 rounded-lg border border-navy-700 text-gray-300">
                {incident.affected_system}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Metadata</h3>
              <div className="bg-navy-900 p-4 rounded-lg border border-navy-700 space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="text-gray-300">{new Date(incident.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="text-gray-300">{new Date(incident.updated_at).toLocaleString()}</p>
                </div>
                {incident.assigned_to && (
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="text-cyber-blue font-medium">{incident.assigned_to.username}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetails;
