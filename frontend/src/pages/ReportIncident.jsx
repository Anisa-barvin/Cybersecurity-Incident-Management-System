import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldPlus, CheckCircle } from 'lucide-react';
import api from '../services/api';

const incidentTypes = [
  'Phishing', 'Malware', 'Ransomware', 'Data Breach', 
  'Unauthorized Access', 'Account Compromise', 'Social Engineering', 
  'Suspicious Activity', 'Other'
];

const severities = ['Critical', 'High', 'Medium', 'Low'];

const ReportIncident = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    incident_type: 'Phishing',
    severity: 'Medium',
    description: '',
    affected_system: '',
    actions_taken: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        actions_taken: formData.actions_taken ? formData.actions_taken.split('\n').filter(a => a.trim() !== '') : []
      };
      
      await api.post('/incidents/', payload);
      setSuccess(true);
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (err) {
      setError('Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <CheckCircle className="h-16 w-16 text-cyber-green mb-4" />
        <h2 className="text-2xl font-bold">Incident Reported Successfully</h2>
        <p className="text-gray-400 mt-2">Redirecting to incidents list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldPlus className="text-cyber-blue" />
          Report Security Incident
        </h1>
      </div>

      <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Incident Type</label>
              <select
                name="incident_type"
                value={formData.incident_type}
                onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
              >
                {incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
              >
                {severities.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Affected System(s)</label>
            <input
              type="text"
              name="affected_system"
              value={formData.affected_system}
              onChange={handleChange}
              required
              placeholder="e.g. Employee Laptop, Main Database, Marketing Website"
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Provide detailed information about the incident..."
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Initial Actions Taken (Optional)</label>
            <textarea
              name="actions_taken"
              value={formData.actions_taken}
              onChange={handleChange}
              rows={3}
              placeholder="Enter each action on a new line..."
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
            />
            <p className="text-xs text-gray-400 mt-1">Separate multiple actions with a new line.</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-navy-700">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mr-3 px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-cyber-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;
