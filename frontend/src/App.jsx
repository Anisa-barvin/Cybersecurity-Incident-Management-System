import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import Incidents from './pages/Incidents';
import IncidentDetails from './pages/IncidentDetails';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';

// Temporary placeholders
const Placeholder = ({ title }) => <div className="text-white text-2xl p-8">{title} Page (Under Construction)</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<ReportIncident />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/:id" element={<IncidentDetails />} />
              <Route path="/profile" element={<Placeholder title="Profile" />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UserManagement />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
