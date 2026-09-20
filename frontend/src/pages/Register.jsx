import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);

    try {
      await register({
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      // Auto login after register
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-navy-800 p-8 rounded-xl border border-navy-700 shadow-2xl">
        <div>
          <div className="mx-auto h-12 w-12 text-cyber-blue flex justify-center items-center">
            <ShieldAlert size={48} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create Account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-md p-3 flex items-center gap-2 text-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <input
              name="full_name" type="text" required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue sm:text-sm"
              placeholder="Full Name" onChange={handleChange} value={formData.full_name}
            />
            <input
              name="username" type="text" required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue sm:text-sm"
              placeholder="Username" onChange={handleChange} value={formData.username}
            />
            <input
              name="email" type="email" required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue sm:text-sm"
              placeholder="Email" onChange={handleChange} value={formData.email}
            />
            <input
              name="password" type="password" required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue sm:text-sm"
              placeholder="Password (min 8 chars)" onChange={handleChange} value={formData.password}
            />
            <input
              name="confirm_password" type="password" required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-navy-700 bg-navy-900 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue sm:text-sm"
              placeholder="Confirm Password" onChange={handleChange} value={formData.confirm_password}
            />
          </div>

          <div>
            <button
              type="submit" disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyber-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyber-blue transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-cyber-blue hover:text-blue-400">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
