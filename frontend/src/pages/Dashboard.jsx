import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertTriangle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import api from '../services/api';

const COLORS = {
  Critical: '#ef4444', // red-500
  High: '#f97316', // orange-500
  Medium: '#eab308', // yellow-500
  Low: '#22c55e', // green-500
  Open: '#ef4444',
  'Under Investigation': '#f97316',
  Resolved: '#22c55e',
  Closed: '#64748b' // slate-500
};

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 flex items-center shadow-lg">
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 mr-4`}>
      <Icon className={`h-8 w-8 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [severityData, setSeverityData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, severityRes, statusRes, typesRes] = await Promise.all([
          api.get('/dashboard/statistics'),
          api.get('/dashboard/severity'),
          api.get('/dashboard/status'),
          api.get('/dashboard/types')
        ]);
        
        setStats(statsRes.data);
        setSeverityData(severityRes.data);
        setStatusData(statusRes.data);
        setTypeData(typesRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full text-cyber-blue">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Incidents" value={stats?.total_incidents || 0} icon={Activity} colorClass="bg-blue-500" />
        <StatCard title="Critical Severity" value={stats?.critical || 0} icon={AlertTriangle} colorClass="bg-red-500" />
        <StatCard title="Open Incidents" value={stats?.open || 0} icon={ShieldAlert} colorClass="bg-orange-500" />
        <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle2} colorClass="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Chart */}
        <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4">Incidents by Severity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4">Incidents by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#0ea5e9'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
