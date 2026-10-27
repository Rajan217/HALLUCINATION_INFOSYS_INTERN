import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const SignInModal = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 900);
  };

  const handleFillDemo = () => {
    setEmail('researcher@veriai.intern');
    setPassword('demo-research-2026');
    setName('Infosys Intern Researcher');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 w-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRegister ? 'Create Evaluation Account' : 'Welcome to AI Validator'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRegister
                ? 'Register to access persistent evaluation logs and API keys'
                : 'Sign in to access your validation history and model metrics'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Researcher Name"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitted}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {submitted ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Authenticated Successfully...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill & Switch */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ⚡ Quick Fill Demo Credentials
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="font-semibold text-purple-600 dark:text-purple-400 hover:underline ml-1"
              >
                {isRegister ? 'Sign In' : 'Register now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
