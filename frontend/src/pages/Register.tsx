import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Mail, User, Lock, Eye, EyeOff, KeyRound, ArrowRight, RotateCw, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AvatarPicker from '../components/AvatarPicker';
import { supabase, isSupabaseConfigured, syncWithBackend } from '../services/supabase';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarId, setAvatarId] = useState('avatar_1');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  // Listen for Supabase session changes (e.g. if user clicks confirmation link directly in email)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        try {
          setIsLoading(true);
          await syncWithBackend(session, {
            display_name: displayName,
            avatar_id: avatarId,
          });
          navigate('/dashboard');
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to sync session with backend');
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, displayName, avatarId]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Create account with password and trigger email OTP verification
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim() || !password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            avatar_id: avatarId,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (sbError) {
        throw sbError;
      }

      // If email confirmation is disabled in Supabase, session is returned immediately
      if (data.session) {
        await syncWithBackend(data.session, {
          display_name: displayName.trim(),
          avatar_id: avatarId,
        });
        navigate('/dashboard');
        return;
      }

      // Otherwise, an OTP code was sent to the email
      setStep(2);
      setResendCooldown(60);
      setInfoMessage(`Verification code sent to ${email.trim()}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify email OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // First try signup verification
      let { data, error: sbError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'signup',
      });

      // If type 'signup' fails, fallback to 'email' type
      if (sbError) {
        const fallback = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'email',
        });
        if (!fallback.error) {
          data = fallback.data;
          sbError = null;
        }
      }

      if (sbError) {
        throw sbError;
      }

      if (!data?.session) {
        throw new Error('Verification completed, but no session returned. Please sign in.');
      }

      // Synchronize with database and obtain application token
      await syncWithBackend(data.session, {
        display_name: displayName.trim(),
        avatar_id: avatarId,
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setError(err.response?.data?.error || err.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError('');
    try {
      const { error: sbError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (sbError) throw sbError;

      setResendCooldown(60);
      setInfoMessage('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
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
          {/* Subtle Accent Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-white">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-textMuted text-sm mt-1.5">
              {step === 1
                ? 'Create your password & verify your email with OTP'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
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

          {error && (
            <div className="p-3 mb-5 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-xl text-center">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3 mb-5 text-sm text-emerald-200 bg-emerald-900/40 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Step 1: Account registration with password */}
          {step === 1 ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Choose Avatar</label>
                <AvatarPicker selectedAvatar={avatarId} onSelect={setAvatarId} />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textMuted">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-textMain text-sm placeholder:text-textMuted/50"
                    placeholder="MovieBuff42"
                    required
                  />
                </div>
              </div>

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
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Password</label>
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
                className="w-full py-3.5 mt-4 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Send Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Enter 6-digit OTP code sent to email */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarId}`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-primary/50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-xs text-textMuted truncate">{email}</p>
                </div>
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
                  <span>Edit</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">6-Digit Code</label>
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
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3.5 mt-4 font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw size={18} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Complete Registration</span>
                )}
              </button>

              <div className="text-center pt-2">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-textMuted">
                    Resend code in <span className="text-white font-medium">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs text-primary hover:text-primaryHover transition-colors font-medium underline underline-offset-2"
                  >
                    Didn't receive a code? Resend
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-sm text-textMuted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primaryHover transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
