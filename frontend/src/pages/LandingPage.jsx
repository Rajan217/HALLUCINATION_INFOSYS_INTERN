import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Shield,
  Layers,
  BarChart3,
  Search,
  CheckCircle2,
  FileText,
  Cpu,
  Database,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import ThreeSphere from '../components/ThreeSphere';

const CYCLING_WORDS = [
  'Hallucination Detection',
  'Claim-Level Verification',
  'Evidence Grounding',
  'Multi-Agent Consensus',
  'SentenceTransformer NLI',
];

const FEATURE_CHIPS = [
  'Claim Extraction',
  'Hallucination Detection',
  'Multi-Agent Scoring',
  'PDF Export',
  'Batch Evaluation',
  'ChromaDB Grounding',
];

const STAGES = [
  {
    step: '01',
    name: 'Input Ingestion',
    desc: 'Prompt & AI generation ingested with optional ground truth reference.',
    icon: '📥',
  },
  {
    step: '02',
    name: 'Claim Extraction',
    desc: 'Decomposes complex paragraphs into atomic, testable factual assertions.',
    icon: '🔍',
  },
  {
    step: '03',
    name: 'Judge Ensemble',
    desc: '4 specialized agents assess Completeness, Accuracy, Relevance & Hallucination.',
    icon: '⚖️',
  },
  {
    step: '04',
    name: 'Aggregation',
    desc: 'Verdict synthesis calculates weighted confidence and categorical risk status.',
    icon: '⚡',
  },
  {
    step: '05',
    name: 'Report Export',
    desc: 'Audit trail generated with per-claim evidence citations and PDF export.',
    icon: '📊',
  },
];

const TECH_STACK = [
  'Three.js WebGL',
  'React 19',
  'FastAPI',
  'ChromaDB',
  'SentenceTransformers',
  'ReportLab',
];

export const LandingPage = ({ onOpenSignIn }) => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [activeStage, setActiveStage] = useState(2);

  // Typewriter / cycling text effect
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blue-900/15 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[400px] bg-indigo-900/15 blur-[150px] pointer-events-none rounded-full" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-md px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              AIValidator
            </span>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="hover:text-white hover:text-purple-400 transition-colors"
            >
              Platform
            </button>
            <button
              onClick={() => navigate('/app/architecture')}
              className="hover:text-white hover:text-purple-400 transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => navigate('/app/docs')}
              className="hover:text-white hover:text-purple-400 transition-colors"
            >
              Documentation
            </button>
            <button
              onClick={() => navigate('/app/about')}
              className="hover:text-white hover:text-purple-400 transition-colors"
            >
              Research
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onOpenSignIn}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-teal-500/80 text-teal-400 hover:bg-teal-500/10 transition-all"
            >
              Register
            </button>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>AI RESPONSE VALIDATION PLATFORM</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Development of{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Response
              </span>{' '}
              Validation System
            </h1>

            {/* Typewriter Subline */}
            <div className="flex items-center gap-2 text-lg sm:text-xl font-medium text-slate-300 min-h-[36px]">
              <span className="text-slate-400">with</span>
              <span className="text-purple-400 font-semibold border-b-2 border-purple-500/60 pb-0.5">
                {CYCLING_WORDS[wordIndex]}
              </span>
            </div>

            {/* Short Paragraph */}
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              An enterprise-grade multi-agent LLM evaluation engine engineered to
              isolate hallucinations, cross-examine claims with semantic grounding,
              and synthesize explainable confidence rubrics.
            </p>

            {/* Feature Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {FEATURE_CHIPS.map((chip, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs font-mono"
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Sign In / Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/app/docs')}
                className="px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-sm bg-slate-900/60 backdrop-blur-sm transition-all"
              >
                Technical Docs
              </button>
            </div>
          </div>

          {/* Right Column: Three.js Interactive 3D Sphere */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <ThreeSphere />
          </div>
        </div>
      </section>

      {/* Features Section (3 Glass Cards) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
            CORE CAPABILITIES
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Engineered for Precision & Grounded Truth
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-purple-500/40 transition-all card-hover group">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 font-display">
              Vector Search & RAG Grounding
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time retrieval from ChromaDB embedding stores index factual
              reference knowledge chunks across benchmarks including TruthfulQA and SQuAD.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-blue-500/40 transition-all card-hover group">
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 font-display">
              Multi-Agent Judge Ensemble
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous agents evaluate Completeness, Semantic Accuracy, Context
              Relevance, and Hallucination Risk with calibrated rubrics.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-emerald-500/40 transition-all card-hover group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 font-display">
              Automated Batch CSV Suite
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Process hundreds of AI completions asynchronously with real-time
              progress streaming, CSV exports, and executive PDF audit generation.
            </p>
          </div>
        </div>
      </section>

      {/* 5-Stage AI Response Verification Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
            PIPELINE ARCHITECTURE
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            5-Stage AI Response Verification
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            A deterministic multi-phase evaluation protocol ensuring grounded factual fidelity
          </p>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {STAGES.map((st, idx) => (
            <div
              key={st.step}
              onClick={() => setActiveStage(idx)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeStage === idx
                  ? 'bg-slate-900 border-purple-500/80 shadow-lg shadow-purple-900/20 scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{st.icon}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeStage === idx
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  STAGE {st.step}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5 font-display">
                {st.name}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#060a10] px-6 lg:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Tech Stack Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-mono mr-2">Tech Stack:</span>
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Launch CTA */}
          <button
            onClick={() => navigate('/app/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-105"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
