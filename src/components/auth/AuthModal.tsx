import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    login,
    loginWithGoogle,
    register,
    showToast,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authModalTab === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials.');
      }
    } else if (authModalTab === 'register') {
      const res = register(name, email, phone, password);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
      }
    } else if (authModalTab === 'forgot') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setResetSuccess(true);
      showToast('Password reset link dispatched to your email!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold">
                {authModalTab === 'login' && 'Sign In to Your Account'}
                {authModalTab === 'register' && 'Create Your Account'}
                {authModalTab === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-400">
                {authModalTab === 'login' && 'Access appointments, reschedule, and manage profile'}
                {authModalTab === 'register' && 'Book fast, track appointments, and view receipts'}
                {authModalTab === 'forgot' && 'We will send a recovery token to your registered email'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {authModalTab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => {
                setError(null);
                openAuthModal('login');
              }}
              className={`py-3 text-center border-b-2 transition-colors ${
                authModalTab === 'login'
                  ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setError(null);
                openAuthModal('register');
              }}
              className={`py-3 text-center border-b-2 transition-colors ${
                authModalTab === 'register'
                  ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Reset Link Sent</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We've sent an instructions link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSuccess(false);
                  openAuthModal('login');
                }}
                className="mt-2 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign-In Option for Real Authentication */}
              {authModalTab !== 'forgot' && (
                <div className="space-y-3 pb-1">
                  <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="w-full flex items-center justify-center space-x-3 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Or continue with account
                    </span>
                  </div>
                </div>
              )}

              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Yogesh Chhura"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {authModalTab === 'login' ? 'Username or Email Address *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authModalTab === 'login' ? 'e.g. yogeshchhura@00 or name@example.com' : 'e.g. name@example.com'}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0101"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {authModalTab !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Password *
                    </label>
                    {authModalTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => openAuthModal('forgot')}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
              >
                <span>
                  {authModalTab === 'login' && 'Sign In'}
                  {authModalTab === 'register' && 'Register Account'}
                  {authModalTab === 'forgot' && 'Send Recovery Email'}
                </span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
