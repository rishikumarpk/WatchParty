import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Mail, Lock, Eye, EyeOff, ArrowRight, RotateCw, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured, syncWithBackend } from '../services/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (!isSupabaseConfigured) {
      setError('Supabase credentials are not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (sbError) {
        throw sbError;
      }

      if (!data.session) {
        throw new Error('No session returned. Please verify your credentials.');
      }

      // Synchronize session with database and save app token
      await syncWithBackend(data.session);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || 'Invalid email or password';
      if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('confirm')) {
        setError("Email confirmation is still enabled in your Supabase project. To allow direct login without email verification, turn off 'Confirm email' under Authentication -> Providers -> Email in your Supabase Dashboard.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-textMain font-sans relative flex flex-col">
      {/* Background Image with Dark Glass Overlay */}
      <img
        src="/background.jpg"
        alt="Watch Together Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full h-20 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-center text-white">
        <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/30">
              <Play size={18} fill="currentColor" />
            </div>
            WatchTogether
          </Link>
          <div>
            <Link
              to="/register"
              className="px-5 py-2 bg-primary/20 border border-primary/40 text-white rounded-lg hover:bg-primary hover:text-white transition-all font-medium shadow-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface/85 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-white">
              Welcome Back
            </h1>
            <p className="text-textMuted text-sm mt-1.5">Sign in to join the watch party</p>
          </div>

          {/* Setup Alert if Supabase Credentials are missing */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Supabase Setup Required</p>
                <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                  Please add your <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">VITE_SUPABASE_URL</code> and{' '}
                  <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">VITE_SUPABASE_ANON_KEY</code> to{' '}
                  <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">frontend/.env</code>.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-5 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-xl text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain placeholder:text-textMuted/50 text-sm"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-textMuted">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:text-primaryHover transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain placeholder:text-textMuted/50 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textMuted hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-textMuted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primaryHover transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
