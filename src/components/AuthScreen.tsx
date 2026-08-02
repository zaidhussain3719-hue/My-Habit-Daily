import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, isFirebaseAvailable, logTelemetryEvent } from '../services/firebaseService';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { DEFAULT_LOGO } from '../data/initialData';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (userProfile: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isFirebaseAvailable && auth) {
        if (isSignUp) {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          logTelemetryEvent('auth_signup_success', { email: cred.user.email });
          onLoginSuccess({
            uid: cred.user.uid,
            name: fullName || email.split('@')[0],
            email: cred.user.email || email,
            photoUrl: '/src/assets/images/user_profile_avatar_1785647019010.jpg',
            dailyTargetPercent: 80,
            themeMode: 'light',
            isGuest: false,
            joinedAt: new Date().toISOString(),
            soundEnabled: true,
            notificationsEnabled: true,
            adMobEnabled: true,
          });
        } else {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          logTelemetryEvent('auth_login_success', { email: cred.user.email });
          onLoginSuccess({
            uid: cred.user.uid,
            name: cred.user.displayName || email.split('@')[0],
            email: cred.user.email || email,
            photoUrl: cred.user.photoURL || '/src/assets/images/user_profile_avatar_1785647019010.jpg',
            dailyTargetPercent: 80,
            themeMode: 'light',
            isGuest: false,
            joinedAt: new Date().toISOString(),
            soundEnabled: true,
            notificationsEnabled: true,
            adMobEnabled: true,
          });
        }
      } else {
        // Fallback local demo auth mode if Firebase project is not provisioned yet
        setTimeout(() => {
          logTelemetryEvent('demo_auth_success', { email });
          onLoginSuccess({
            uid: 'demo_user_' + Date.now(),
            name: fullName || email.split('@')[0],
            email: email,
            photoUrl: '/src/assets/images/user_profile_avatar_1785647019010.jpg',
            dailyTargetPercent: 80,
            themeMode: 'light',
            isGuest: false,
            joinedAt: new Date().toISOString(),
            soundEnabled: true,
            notificationsEnabled: true,
            adMobEnabled: true,
          });
        }, 600);
      }
    } catch (err: any) {
      console.error('Auth error', err);
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      logTelemetryEvent('auth_error', { message: err.message }, 'crashlytics');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      if (isFirebaseAvailable && auth) {
        await sendPasswordResetEmail(auth, resetEmail);
        setSuccessMessage('Password reset email sent! Check your inbox.');
      } else {
        setSuccessMessage('Simulated password reset email sent to ' + resetEmail);
      }
      setShowForgotModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-emerald-900/10 border border-emerald-100 dark:border-slate-800 p-6 sm:p-8"
      >
        {/* App Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md mb-3 flex items-center justify-center">
            <img
              src={DEFAULT_LOGO}
              alt="My Habit Daily"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSignUp ? 'Sign up to start tracking your daily habits' : 'Log in to sync your habits and streaks'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-emerald-100/60 dark:bg-slate-800 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              !isSignUp
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              isSignUp
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">Or</span>
          </div>
        </div>

        {/* Guest Demo Login Button */}
        <button
          type="button"
          onClick={onContinueAsGuest}
          className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-slate-200/60 dark:border-slate-700"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Continue as Guest (Instant Demo)</span>
        </button>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email address to receive password recovery instructions.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
