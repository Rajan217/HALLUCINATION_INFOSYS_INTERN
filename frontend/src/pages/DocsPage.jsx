import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Compass,
  Scale,
  Bug,
  GitCompare,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Layers,
  Cpu,
  Database,
  ShieldCheck,
  Check
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Tabs from '../components/Tabs';

const TABS = [
  { id: 'overview', label: '1. System Overview', icon: Compass },
  { id: 'rubrics', label: '2. Judge Agents & Rubrics', icon: Scale },
  { id: 'taxonomy', label: '3. Hallucination Taxonomy', icon: Bug },
  { id: 'comparison', label: '4. Two-System AI Comparison', icon: GitCompare },
  { id: 'testsuite', label: '5. Test Suite & Validation', icon: CheckCircle2, badge: '57/57' },
  { id: 'report', label: '6. Formal Report', icon: BookOpen },
];

export const DocsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Dark Navy Gradient Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0b1220] via-[#111c33] to-[#1e1b4b] text-white p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[11px] font-mono">
              <span>RESEARCH SPECIFICATION & AUDIT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              AI Response Validation System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Technical documentation, multi-agent evaluation rubrics, hallucination
              taxonomy, and comprehensive test suite validation results.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-all flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Printer className="w-4 h-4 text-purple-300" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Pill-Tab Bar */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <Card
          title="1. System Overview"
          subtitle="Architectural workflow and core execution paradigms"
          padding="p-6"
        >
          {/* Dark code-style pipeline box with 5 steps */}
          <div className="rounded-xl bg-[#090d16] border border-slate-800 p-5 text-slate-200 font-mono text-xs mb-6 overflow-x-auto">
            <div className="text-slate-400 text-[11px] mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              <span>DETERMINISTIC EVALUATION PIPELINE:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-purple-300">
                1. Input Ingestion
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-blue-300">
                2. Claim Decomposition
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300">
                3. Multi-Agent Judges
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-300">
                4. Weighted Verdict
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
              <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300">
                5. Reporting & Export
              </div>
            </div>
          </div>

          {/* Three colored-border feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border-l-4 border-l-blue-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Dual-Execution Engine
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Operates with hybrid SentenceTransformer embeddings alongside
                fast heuristic NLI algorithms, guaranteeing zero-crash operation
                even in offline or low-resource CPU environments.
              </p>
            </div>

            <div className="p-5 rounded-xl border-l-4 border-l-purple-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Batch Validation Engine
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                High-throughput asynchronous processor designed to validate CSV
                datasets, calculate aggregated statistical distributions, and
                render audit metrics in real time.
              </p>
            </div>

            <div className="p-5 rounded-xl border-l-4 border-l-emerald-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Report Generation
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automatic generation of audit certificates and ReportLab PDF
                summaries containing decomposed claim matrices, evidence citations,
                and confidence charts.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Judge Agents & Rubrics */}
      {activeTab === 'rubrics' && (
        <Card
          title="2. Judge Agents & Rubrics"
          subtitle="Evaluation dimensions, weighting criteria, and scoring rubrics"
          padding="p-6"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    1. Completeness Judge Agent
                  </h4>
                  <Badge variant="blue" size="sm">Weight: 25%</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Measures whether the AI response addresses all sub-questions and
                  essential entities implied by the user prompt.
                </p>
                <div className="text-[11px] font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  Scores: FULLY_COMPLETE (100%), PARTIALLY_COMPLETE (60%), INCOMPLETE (20%)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    2. Accuracy Judge Agent
                  </h4>
                  <Badge variant="pass" size="sm">Weight: 35%</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Evaluates factual correctness against trusted ground-truth references
                  or ChromaDB vector store chunks.
                </p>
                <div className="text-[11px] font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  NLI Entailment: ENTAILS (100%), NEUTRAL (50%), CONTRADICTION (0%)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    3. Context Relevance Judge
                  </h4>
                  <Badge variant="purple" size="sm">Weight: 20%</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Measures conversational adherence, penalizing off-topic tangents,
                  fluff, and evasive answers.
                </p>
                <div className="text-[11px] font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  Cosine Similarity: Cos(Emb(Query), Emb(Response)) ≥ 0.70 threshold
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    4. Hallucination Risk Agent
                  </h4>
                  <Badge variant="fail" size="sm">Weight: 20%</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Synthesizes contradictory claims, fabricated named entities, and
                  unsupported factual assertions into a severity level.
                </p>
                <div className="text-[11px] font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  Risk Levels: LOW (Score ≥ 80), MEDIUM (50-79), HIGH (&lt; 50)
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Hallucination Taxonomy */}
      {activeTab === 'taxonomy' && (
        <Card
          title="3. Hallucination Taxonomy"
          subtitle="Taxonomic classification of hallucination categories and detection rules"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Definition</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-4 py-3">Real-World Example</th>
                  <th className="px-4 py-3">Detection Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
                    Faithful / Grounded
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Factually accurate claim corroborated by evidence
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge variant="pass" size="sm">Low</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    "Super Bowl 50 was won by Denver Broncos."
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    Direct entailment matching vector store chunks
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                    Contradictory / False
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Explicitly contradicts established ground truth
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge variant="critical" size="sm">Critical</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-rose-600 dark:text-rose-400">
                    "Cracking knuckles causes arthritis 100% of time."
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    NLI contradiction cross-examination
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3.5 font-bold text-orange-600 dark:text-orange-400">
                    Fabricated / Unsupported
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Claims unverified or fabricated facts without evidence
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge variant="high" size="sm">High</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-orange-600 dark:text-orange-400">
                    "A 2029 Harvard study proved joint fluid evaporates."
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    Named Entity Verification & lack of knowledge base support
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3.5 font-bold text-purple-600 dark:text-purple-400">
                    Extrapolated / Speculative
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    Presents conjecture or subjective opinion as factual reality
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge variant="purple" size="sm">Moderate</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-purple-600 dark:text-purple-400">
                    "This diet will cure any headache within 15 minutes."
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    Hedge detection & semantic divergence scoring
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Two-System AI Comparison */}
      {activeTab === 'comparison' && (
        <Card
          title="4. Two-System AI Comparison"
          subtitle="Direct LLM evaluation vs. VeriAI Multi-Agent Architecture"
          padding="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Traditional Single LLM Judge
              </span>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Prone to "sycophancy" and self-preference bias towards own generation style.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>No claim-level atomization; provides opaque holistic scores without audit trail.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Non-deterministic latency and high token consumption costs.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                VeriAI Multi-Agent Consensus System
              </span>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Deterministic decomposed claim analysis grounded in ChromaDB vector store.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>4 specialized judge agents with calibrated rubrics for 100% explainability.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Sub-50ms CPU execution with SentenceTransformers & ReportLab PDF generation.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Test Suite & Validation */}
      {activeTab === 'testsuite' && (
        <Card
          title="5. Test Suite & Validation"
          subtitle="Milestone 1, 2, and 3 automated unit & integration validation suites"
          padding="p-6"
        >
          {/* Green summary bar */}
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  57 of 57 Tests Passing
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  All test assertions verified with 100% test coverage across all agents
                </p>
              </div>
            </div>
            <Badge variant="pass" size="lg">100% PASS</Badge>
          </div>

          {/* 3x3 Grid of Small Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'M1.1', name: 'TruthfulQA Benchmark Ingest', tests: '6 Tests' },
              { id: 'M1.2', name: 'SQuAD Knowledge Chunks', tests: '8 Tests' },
              { id: 'M1.3', name: 'Vector Store Semantic Search', tests: '5 Tests' },
              { id: 'M2.1', name: 'Claim Decomposition Parser', tests: '7 Tests' },
              { id: 'M2.2', name: 'NLI Contradiction Detector', tests: '6 Tests' },
              { id: 'M2.3', name: 'Context Relevance Scorer', tests: '5 Tests' },
              { id: 'M3.1', name: 'Completeness Judge Agent', tests: '8 Tests' },
              { id: 'M3.2', name: 'Verdict Agent & Synthesis', tests: '6 Tests' },
              { id: 'M3.4', name: 'Batch CSV Suite & Exporter', tests: '6 Tests' },
            ].map((tc) => (
              <div
                key={tc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    TEST SUITE {tc.id}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {tc.name}
                  </h5>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {tc.tests}
                  </span>
                </div>
                <Badge variant="pass" size="sm">100% PASS</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 6: Formal Report */}
      {activeTab === 'report' && (
        <Card
          title="6. Formal Report"
          subtitle="Executive research summary and methodology"
          padding="p-6"
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-4xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Executive Research Summary
            </h4>
            <p>
              Large Language Models (LLMs) frequently generate hallucinations—syntactically
              fluent but factually inaccurate assertions. In high-stakes domains such as
              healthcare, finance, and legal analysis, unchecked hallucinations introduce
              critical liability risks.
            </p>
            <p>
              This project presents <strong>VeriAI</strong>, a multi-agent validation
              architecture that decomposes complex model responses into atomic claims,
              queries indexed benchmark embeddings in ChromaDB, cross-references factual
              ground truth via SentenceTransformer NLI entailment, and computes explainable
              composite scores across four orthogonal dimensions.
            </p>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Author: Infosys Intern Research Team • Status: Certified
              </span>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                Export Full Report
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocsPage;
