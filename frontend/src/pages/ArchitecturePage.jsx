import React from 'react';
import {
  Network,
  FileCode,
  Database,
  FileDown,
  Layers,
  Cpu,
  CheckCircle2,
  Server
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

const MODULES = [
  {
    title: 'PDF Report Generator',
    path: 'app/api/pdf_exporter.py',
    border: 'border-l-purple-500',
    bullets: [
      'Generates branded PDF audit reports with ReportLab Platypus engine.',
      'Renders custom flowable tables for decomposed claims and confidence gauges.',
      'Outputs in-memory binary streams directly to FastAPI streaming response.',
    ],
  },
  {
    title: 'Database & Vector Store Layer',
    path: 'app/kb/vector_store.py & app/kb/ingestion.py',
    border: 'border-l-blue-500',
    bullets: [
      'ChromaDB vector store indexed with all-MiniLM-L6-v2 embeddings.',
      'Pre-seeded with TruthfulQA factual knowledge and SQuAD benchmark chunks.',
      'Supports semantic nearest-neighbor retrieval with cosine distance calibration.',
    ],
  },
  {
    title: 'Multi-Agent Orchestrator',
    path: 'app/agents/orchestrator.py',
    border: 'border-l-emerald-500',
    bullets: [
      'Sequential pipeline coordinator managing execution flow across all 4 agents.',
      'Handles fallback execution, timing benchmarks, and latency telemetry.',
      'Aggregates per-dimension score dictionaries into standardized EvaluationVerdict.',
    ],
  },
  {
    title: 'Completeness Judge Agent',
    path: 'app/agents/completeness_judge.py',
    border: 'border-l-amber-500',
    bullets: [
      'Extracts required factual aspects from user prompts using syntactic decomposition.',
      'Tracks covered aspects vs missing aspects with calibrated rubrics.',
      'Outputs categorical verdict: FULLY_COMPLETE, PARTIALLY_COMPLETE, or INCOMPLETE.',
    ],
  },
  {
    title: 'Hallucination Detector Agent',
    path: 'app/agents/hallucination_detector.py',
    border: 'border-l-rose-500',
    bullets: [
      'Decomposes multi-sentence model outputs into atomic verifiable factual claims.',
      'Cross-examines each claim against retrieved evidence chunks via NLI heuristics.',
      'Assigns severity levels: CRITICAL, HIGH, MODERATE, or LOW.',
    ],
  },
];

const ENDPOINTS = [
  {
    method: 'POST',
    methodColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    path: '/api/v1/evaluate',
    desc: 'Submits a single Q&A evaluation request and returns structured multi-agent verdict details.',
  },
  {
    method: 'GET',
    methodColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
    path: '/api/v1/evaluations',
    desc: 'Retrieves recent evaluation submissions and verdicts with optional verdict filtering.',
  },
  {
    method: 'GET',
    methodColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
    path: '/api/v1/evaluations/{eval_id}',
    desc: 'Retrieves complete multi-agent breakdown for an individual evaluation submission.',
  },
  {
    method: 'POST',
    methodColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    path: '/api/v1/evaluate/batch',
    desc: 'Uploads and validates a batch CSV containing multi-record questions and model responses.',
  },
  {
    method: 'GET',
    methodColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
    path: '/api/v1/evaluate/batch/{batch_id}/export',
    desc: 'Exports batch evaluation audit records as a downloadable CSV file.',
  },
  {
    method: 'GET',
    methodColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
    path: '/api/v1/evaluate/batch/{batch_id}/pdf',
    desc: 'Generates and streams an executive PDF audit certificate for a completed batch evaluation.',
  },
  {
    method: 'GET',
    methodColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
    path: '/api/v1/analytics/dashboard',
    desc: 'Returns aggregated high-level evaluation metrics, reliability averages, and claim distributions.',
  },
  {
    method: 'POST',
    methodColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    path: '/api/v1/search',
    desc: 'Performs semantic similarity vector search directly against the ChromaDB knowledge base.',
  },
  {
    method: 'DELETE',
    methodColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800',
    path: '/api/v1/evaluations/{eval_id}',
    desc: 'Permanently deletes an evaluation audit record from persistent storage.',
  },
];

export const ArchitecturePage = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          System Architecture
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Modular subsystem decomposition, file topologies, and REST API contract specification
        </p>
      </div>

      {/* Module Cards Stack */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Core Module Topologies
        </h3>

        {MODULES.map((mod, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${mod.border} shadow-soft card-hover`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                {mod.title}
              </h4>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs w-max">
                {mod.path}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {mod.bullets.map((b, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* REST API Endpoints List */}
      <Card
        title="REST API Endpoints Specification"
        subtitle="FastAPI v3.0 routes with HTTP methods, paths, and contracts"
        padding="p-6"
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {ENDPOINTS.map((ep, idx) => (
            <div
              key={idx}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${ep.methodColor}`}
                >
                  {ep.method}
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {ep.path}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-right max-w-md">
                {ep.desc}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ArchitecturePage;
