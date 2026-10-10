import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Mail, Lock, Eye, EyeOff, ArrowRight, RotateCw, AlertTriangle, CheckCircle2, MailCheck, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Listen for Supabase PASSWORD_RECOVERY event when user clicks the reset link in email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    // Also check if current URL hash or session indicates recovery
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && window.location.hash.includes('type=recovery')) {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Step 1: Send reset link to email
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Please configure frontend/.env');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/forgot-password`,
      });

      if (sbError) throw sbError;

      setIsEmailSent(true);
      setInfoMessage(`We sent a password reset link to ${email.trim()}`);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Set new password (after clicking reset link)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: sbError } = await supabase.auth.updateUser({
        password: password,
      });

      if (sbError) throw sbError;

      setIsSuccess(true);
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface/85 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-white">
              {isSuccess
                ? 'Password Updated!'
                : isRecoveryMode
                ? 'Set New Password'
                : isEmailSent
                ? 'Check Your Email'
                : 'Reset Password'}
            </h1>
            <p className="text-textMuted text-sm mt-1.5">
              {isSuccess
                ? 'Your password has been changed successfully'
                : isRecoveryMode
                ? 'Enter your new strong password below'
                : isEmailSent
                ? 'Click the reset link in your email'
                : 'Enter your email to receive a password recovery link'}
            </p>
          </div>

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

          {error && (
            <div className="p-3 mb-5 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-xl text-center">
              {error}
            </div>
          )}

          {infoMessage && !isSuccess && (
            <div className="p-3 mb-5 text-sm text-emerald-200 bg-emerald-900/40 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <p className="text-sm text-textMuted">You can now sign in with your new password.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95"
              >
                Sign In Now
              </button>
            </div>
          ) : isRecoveryMode ? (
            /* Set New Password Form (triggered by clicking link in email) */
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain text-sm placeholder:text-textMuted/50"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textMuted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain text-sm placeholder:text-textMuted/50"
                    placeholder="Repeat new password"
                    required
                    minLength={6}
                  />
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </form>
          ) : isEmailSent ? (
            /* Check Email Screen */
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xl shadow-primary/10 relative">
                <MailCheck size={40} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping"></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-textMuted">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-white text-base bg-black/30 py-2 px-4 rounded-xl border border-white/5 inline-block">
                  {email}
                </p>
                <p className="text-xs text-textMuted/80 pt-1 leading-relaxed">
                  Please click the link inside your email to choose your new password.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Open Gmail</span>
                  <ExternalLink size={16} />
                </a>

                <button
                  type="button"
                  onClick={() => setIsEmailSent(false)}
                  className="text-xs text-textMuted hover:text-white transition-colors"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            /* Request Reset Link Form */
            <form onSubmit={handleSendResetLink} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain text-sm placeholder:text-textMuted/50"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
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
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-textMuted">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:text-primaryHover transition-colors font-medium">
                Back to Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
