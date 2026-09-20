import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  List, 
  BarChart2, 
  Users, 
  ClipboardList, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Incident', path: '/report', icon: ShieldAlert },
    { name: 'Incidents', path: '/incidents', icon: List },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminItems = [
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
  ];

  return (
    <div className="w-64 bg-navy-800 border-r border-navy-700 h-screen flex flex-col hidden md:flex">
      <div className="p-6 border-b border-navy-700">
        <h1 className="text-2xl font-bold text-cyber-blue flex items-center gap-2">
          <ShieldAlert className="text-cyber-green" />
          CyberShield
        </h1>
        <p className="text-xs text-gray-400 mt-1">Incident Management</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-navy-700 text-cyber-blue'
                    : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
          
          {user?.role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-navy-700 text-cyber-green'
                        : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </div>
      
      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-cyber-blue font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-navy-700 hover:text-red-300 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
