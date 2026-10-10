import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-textMain font-sans relative flex flex-col">
      <img
        src="/background.jpg"
        alt="Watch Party Background"
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
              to="/login"
              className="px-5 py-2 bg-primary/20 border border-primary/40 text-white rounded-lg hover:bg-primary hover:text-white transition-all font-medium shadow-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface/85 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <ShieldCheck size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary mb-3">
            <Sparkles size={12} />
            <span>Passwordless Authentication</span>
          </div>

          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-white mb-2">
            No Passwords Needed!
          </h1>

          <p className="text-textMuted text-sm leading-relaxed mb-6">
            WatchTogether has upgraded to Supabase passwordless authentication. You never have to worry about forgetting, resetting, or losing passwords again.
          </p>

          <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-left mb-6 space-y-2 text-xs text-textMuted">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Simply enter your email address when signing in</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Receive an instant 6-digit one-time code to your inbox</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Fast, secure, and zero email service errors</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Go to Passwordless Sign In</span>
            <ArrowRight size={18} />
          </button>

          <p className="mt-6 text-sm text-textMuted">
            Need a new account?{' '}
            <Link to="/register" className="text-primary hover:text-primaryHover transition-colors font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
