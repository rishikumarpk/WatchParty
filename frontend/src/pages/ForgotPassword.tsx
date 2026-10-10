import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Mail, KeyRound, Lock, Eye, EyeOff, ArrowRight, RotateCw, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send reset code to email
  const handleSendResetCode = async (e: React.FormEvent) => {
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

      setStep(2);
      setInfoMessage(`We sent a 6-digit recovery code to ${email.trim()}`);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify the recovery OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: sbError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'recovery',
      });

      if (sbError) throw sbError;

      setStep(3);
      setInfoMessage('Code verified. You can now set your new password.');
    } catch (err: any) {
      console.error('Verify recovery code error:', err);
      setError(err.message || 'Invalid or expired recovery code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set new password
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
      // Sign out of recovery session so they can login freshly with new password
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
                : step === 1
                ? 'Reset Password'
                : step === 2
                ? 'Verify Code'
                : 'New Password'}
            </h1>
            <p className="text-textMuted text-sm mt-1.5">
              {isSuccess
                ? 'Your password has been changed successfully'
                : step === 1
                ? 'Enter your email to receive a recovery code'
                : step === 2
                ? `Enter the 6-digit code sent to ${email}`
                : 'Create your new strong password'}
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
          ) : step === 1 ? (
            /* Step 1: Email Form */
            <form onSubmit={handleSendResetCode} className="space-y-4">
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
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : step === 2 ? (
            /* Step 2: Code verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-textMuted">6-Digit Code</label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                  }}
                  className="text-xs text-primary hover:text-primaryHover transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={12} />
                  <span>Change email</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain tracking-[0.4em] font-mono text-center text-xl placeholder:text-textMuted/30"
                  placeholder="••••••"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3.5 mt-2 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw size={18} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </form>
          ) : (
            /* Step 3: New Password Form */
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
                  <span>Update Password</span>
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
