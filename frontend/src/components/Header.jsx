import React from 'react';
import { Moon, Sun, LogIn, Menu, ShieldCheck } from 'lucide-react';

export const Header = ({
  title = 'Dashboard',
  subtitle = 'Overview of AI response reliability & hallucination metrics',
  onMenuToggle = () => {},
  onOpenSignIn = () => {},
  isDarkMode = false,
  toggleDarkMode = () => {},
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Dark Mode Toggle & Purple Sign In Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Multi-Agent Engine Online</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Purple Sign In Button */}
        <button
          onClick={onOpenSignIn}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
