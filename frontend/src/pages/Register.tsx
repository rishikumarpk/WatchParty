import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Mail, User, Lock, Eye, EyeOff, ArrowRight, RotateCw, AlertTriangle, CheckCircle2, MailCheck, ExternalLink } from 'lucide-react';
import AvatarPicker from '../components/AvatarPicker';
import { supabase, isSupabaseConfigured, syncWithBackend } from '../services/supabase';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarId, setAvatarId] = useState('avatar_1');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  // Listen for Supabase session changes (e.g. user clicks verification link in email)
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

  // Countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

      // Otherwise, the verification email was sent
      setIsSubmitted(true);
      setResendCooldown(60);
      setInfoMessage(`Verification link sent to ${email.trim()}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError('');
    try {
      const { error: sbError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (sbError) throw sbError;

      setResendCooldown(60);
      setInfoMessage('A fresh verification link has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification link');
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
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-white">
              {isSubmitted ? 'Check Your Email' : 'Create Account'}
            </h1>
            <p className="text-textMuted text-sm mt-1.5">
              {isSubmitted
                ? 'We sent a confirmation link to your inbox'
                : 'Choose your avatar, enter your details and password'}
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

          {infoMessage && (
            <div className="p-3 mb-5 text-sm text-emerald-200 bg-emerald-900/40 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {!isSubmitted ? (
            /* Signup Form */
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
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Check Email Confirmation Screen */
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xl shadow-primary/10 relative">
                <MailCheck size={40} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping"></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-textMuted">
                  We've sent an activation link to:
                </p>
                <p className="font-semibold text-white text-base bg-black/30 py-2 px-4 rounded-xl border border-white/5 inline-block">
                  {email}
                </p>
                <p className="text-xs text-textMuted/80 pt-1 leading-relaxed">
                  Please click the link inside the email to verify your address and join the party.
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

                {resendCooldown > 0 ? (
                  <p className="text-xs text-textMuted pt-1">
                    Resend email in <span className="text-white font-medium">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendLink}
                    disabled={isLoading}
                    className="text-xs text-primary hover:text-primaryHover transition-colors font-medium underline underline-offset-2"
                  >
                    Didn't receive the email? Resend link
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs text-textMuted hover:text-white transition-colors"
                >
                  Change details / Try another email
                </button>
              </div>
            </div>
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
