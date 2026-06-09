import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-textMain font-sans relative flex flex-col">
      {/* Background Image */}
      <img 
        src="/background.jpg" 
        alt="Watch Party Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-center text-white">
        <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Play size={18} fill="currentColor" />
              </div>
              WatchTogether
            </Link>
          </div>
          <div>
            <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors font-medium shadow-sm shadow-primary/50">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
              Watch Together
            </h1>
            <p className="text-textMuted mt-2">Sign in to join the party</p>
          </div>

          {error && <div className="p-3 mb-6 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-lg text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-textMain"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-textMain"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-textMuted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primaryHover transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Login;
