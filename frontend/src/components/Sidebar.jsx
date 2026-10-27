import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Layers,
  BarChart3,
  History,
  FileText,
  Network,
  Code2,
  Info,
  Settings,
  Zap,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/validate', label: 'Validate Response', icon: CheckCircle2 },
  { path: '/app/batch', label: 'Batch Evaluation', icon: Layers },
  { path: '/app/analytics', label: 'Evaluation & Analytics', icon: BarChart3 },
  { path: '/app/history', label: 'Validation History', icon: History },
  { path: '/app/docs', label: 'Technical Docs & Report', icon: FileText },
  { path: '/app/architecture', label: 'System Architecture', icon: Network },
  { path: '/app/code-walkthrough', label: 'Code Walkthrough', icon: Code2 },
  { path: '/app/about', label: 'About Project', icon: Info },
  { path: '/app/settings', label: 'Account & Settings', icon: Settings },
];

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[220px] bg-[#0b1220] text-white flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-white text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1 font-display">
                  AI Validator
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  Hallucination Detection
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Label */}
          <div className="mt-6 mb-2 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              NAVIGATION
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-md shadow-blue-900/30 font-semibold'
                      : 'text-[#94a3b8] hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions & Project Badge */}
        <div className="p-3 border-t border-slate-800/80 space-y-2.5">
          {/* Teal Outlined Settings Button */}
          <button
            onClick={() => {
              navigate('/app/settings');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-teal-500/70 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 text-xs font-medium transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account & Settings</span>
          </button>

          {/* Research Project Dark Card */}
          <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold tracking-wider text-purple-400 mb-1">
              <span>Research Project</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-slate-300 leading-snug font-medium text-[10.5px]">
              AI Hallucination Detection & Response Validation System
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
