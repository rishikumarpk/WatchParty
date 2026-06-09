import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      await api.post('/auth/verify-reset-code', { email, code });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-textMain font-sans relative flex flex-col">
      <img src="/background.jpg" alt="Watch Party Background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>

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
            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors font-medium shadow-sm shadow-primary/50">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
              Reset Password
            </h1>
          </div>

          {error && <div className="p-3 mb-4 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-lg text-center">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
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
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 mt-2 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-textMuted text-center mb-4">Enter the 6-digit code sent to <strong>{email}</strong></p>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Reset Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-textMain text-center tracking-widest text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 mt-2 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">New Password</label>
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
                disabled={isProcessing}
                className="w-full py-3 mt-2 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-textMuted">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:text-primaryHover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
