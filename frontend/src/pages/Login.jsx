import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-navy-800 p-8 rounded-xl border border-navy-700 shadow-2xl">
        <div>
          <div className="mx-auto h-12 w-12 text-cyber-green flex justify-center items-center">
            <ShieldAlert size={48} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            CyberShield
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to access the SOC Dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-md p-3 flex items-center gap-2 text-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyber-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyber-blue transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/register" className="font-medium text-cyber-blue hover:text-blue-400">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
