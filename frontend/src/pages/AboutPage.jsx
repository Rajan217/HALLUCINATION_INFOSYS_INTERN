import React from 'react';
import {
  Shield,
  CheckCircle2,
  TrendingUp,
  Eye,
  Award,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import Card from '../components/Card';

const RESEARCH_TAGS = [
  'AI Hallucination Detection',
  'Claim-Level Verification',
  'Evidence Grounding',
  'Semantic Similarity',
  'Contradiction Detection',
  'Confidence Estimation',
  'Response Reliability',
  'Explainable AI',
  'Trustworthy AI',
];

const OBJECTIVES = [
  {
    title: 'Detect Potential Hallucinations',
    desc: 'Identify ungrounded, contradictory, or fabricated factual assertions in LLM outputs before they reach downstream users or databases.',
    icon: Shield,
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
  },
  {
    title: 'Validate Factual Claims',
    desc: 'Decompose sentences into atomic propositions and cross-examine them against curated vector knowledge stores and reference context.',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
  },
  {
    title: 'Estimate Confidence',
    desc: 'Calculate calibrated reliability metrics using weighted multi-agent consensus rather than black-box heuristic likelihood.',
    icon: TrendingUp,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400',
  },
  {
    title: 'Improve Transparency',
    desc: 'Provide comprehensive explainable reasoning logs, per-claim citations, and exportable PDF audit trails for full accountability.',
    icon: Eye,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400',
  },
];

export const AboutPage = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Gradient Header */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 sm:p-8 shadow-lg shadow-purple-900/10">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>INFOSYS INTERNSHIP RESEARCH PROJECT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            About the AI Response Validation System
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Empowering enterprise AI adopters with explainable, deterministic, and
            trust-calibrated response validation.
          </p>
        </div>
      </div>

      {/* Research Context Card with Grid of Blue Chip Tags */}
      <Card
        title="Research Context & Methodological Foundations"
        subtitle="Key theoretical pillars and algorithmic disciplines applied across the system"
        padding="p-6"
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          The VeriAI platform unites advancements in Natural Language Inference (NLI),
          dense vector representations, and multi-agent consensus protocols to address
          the fundamental hallucination challenge in generative language models.
        </p>

        <div className="flex flex-wrap gap-2.5">
          {RESEARCH_TAGS.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm transition-all hover:scale-105 cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Card>

      {/* Project Objectives 2-Column Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Core Project Objectives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OBJECTIVES.map((obj, idx) => {
            const Icon = obj.icon;
            return (
              <Card key={idx} hover padding="p-5">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl shrink-0 ${obj.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-1">
                      {obj.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {obj.desc}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
