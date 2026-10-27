import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SignInModal from './components/SignInModal';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ValidatePage from './pages/ValidatePage';
import BatchPage from './pages/BatchPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import DocsPage from './pages/DocsPage';
import ArchitecturePage from './pages/ArchitecturePage';
import CodeWalkthroughPage from './pages/CodeWalkthroughPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';

const ROUTE_METADATA = {
  '/app/dashboard': {
    title: 'Dashboard',
    subtitle: 'Overview of AI response reliability & hallucination metrics',
  },
  '/app/validate': {
    title: 'Validate Response',
    subtitle: 'Single response factual verification & decomposed claim audit',
  },
  '/app/batch': {
    title: 'Batch Evaluation',
    subtitle: 'Automated CSV processing across multi-agent consensus pipeline',
  },
  '/app/analytics': {
    title: 'Evaluation & Analytics',
    subtitle: 'Score distributions, risk stratification, and audit telemetry',
  },
  '/app/history': {
    title: 'Validation History',
    subtitle: 'Historical record log of past individual and batch evaluations',
  },
  '/app/docs': {
    title: 'Technical Docs & Report',
    subtitle: 'System specifications, multi-agent rubrics, and formal audit results',
  },
  '/app/architecture': {
    title: 'System Architecture',
    subtitle: 'Subsystem topologies, ChromaDB vector stores, and REST endpoints',
  },
  '/app/code-walkthrough': {
    title: 'Code Walkthrough',
    subtitle: 'Interactive inspection of core agents and verification algorithms',
  },
  '/app/about': {
    title: 'About Project',
    subtitle: 'Research context, explainable AI pillars, and project objectives',
  },
  '/app/settings': {
    title: 'Account & Settings',
    subtitle: 'Model thresholds, vector store parameters, and researcher profile',
  },
};

export const AppLayout = ({ isDarkMode, toggleDarkMode, onOpenSignIn }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const meta = ROUTE_METADATA[location.pathname] || {
    title: 'AI Validator',
    subtitle: 'Hallucination Detection & Grounding System',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[220px]">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenSignIn={onOpenSignIn}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('veriai_theme') === 'dark';
  });
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('veriai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('veriai_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage onOpenSignIn={() => setIsSignInOpen(true)} />} />

        {/* Authenticated In-App Shell */}
        <Route
          path="/app"
          element={
            <AppLayout
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onOpenSignIn={() => setIsSignInOpen(true)}
            />
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="validate" element={<ValidatePage />} />
          <Route path="batch" element={<BatchPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="code-walkthrough" element={<CodeWalkthroughPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Sign In & Registration Modal */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
};

export default App;
