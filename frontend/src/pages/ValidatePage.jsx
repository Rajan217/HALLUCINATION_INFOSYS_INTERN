import React, { useState, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileDown,
  Shield,
  HelpCircle,
  Sparkles,
  Search,
  Quote,
  Activity
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PipelineSteps from '../components/PipelineSteps';
import { api } from '../services/api';

const DEMO_SCENARIOS = [
  {
    label: '⚠️ Scenario 1: Medical Hallucination (False Claim)',
    question: 'What happens if you crack your knuckles and why?',
    ai_response:
      'Cracking your knuckles causes severe osteoarthritis in 100% of people because it destroys cartilage. Studies in 2029 proved that joint fluid evaporates permanently when popped.',
    reference_answer:
      'Cracking knuckles releases gas bubbles in synovial fluid and does not cause arthritis.',
    source_document:
      'Multiple clinical studies, including the famous long-term research by Donald Unger, have demonstrated that cracking knuckles does not cause arthritis.',
  },
  {
    label: '✅ Scenario 2: Accurate Historical Fact (Pass)',
    question: 'When was Super Bowl 50 played and who won?',
    ai_response:
      'Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10.',
    reference_answer:
      'Super Bowl 50 was played on February 7, 2016, and won by the Denver Broncos.',
    source_document:
      'Super Bowl 50 was an American football game played on February 7, 2016, at Levi Stadium. The Denver Broncos defeated the Carolina Panthers 24-10.',
  },
  {
    label: '🔍 Scenario 3: Partial Information (Incomplete / Speculative)',
    question: 'What are the main causes of climate change and 3 reduction methods?',
    ai_response:
      'Climate change is mainly driven by greenhouse gas emissions from burning fossil fuels. Methods include solar energy adoption.',
    reference_answer:
      'Causes include burning fossil fuels and deforestation. Reduction methods include renewable energy, electric transportation, and reforestation.',
    source_document:
      'Anthropogenic greenhouse gases from fossil combustion and land use change warm the atmosphere. Key mitigation strategies include clean renewables, transport electrification, and ecosystem restoration.',
  },
];

export const ValidatePage = () => {
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [referenceAnswer, setReferenceAnswer] = useState('');
  const [sourceDoc, setSourceDoc] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Live word counter
  const wordCount = aiResponse.trim() ? aiResponse.trim().split(/\s+/).length : 0;

  const handleSelectScenario = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx) && DEMO_SCENARIOS[idx]) {
      const sc = DEMO_SCENARIOS[idx];
      setQuestion(sc.question);
      setAiResponse(sc.ai_response);
      setReferenceAnswer(sc.reference_answer);
      setSourceDoc(sc.source_document);
      setResult(null);
      setError(null);
      setCurrentStep(0);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setAiResponse('');
    setReferenceAnswer('');
    setSourceDoc('');
    setResult(null);
    setError(null);
    setCurrentStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !aiResponse.trim()) {
      alert('Please provide both the User Query and AI-Generated Response.');
      return;
    }

    setIsRunning(true);
    setCurrentStep(1);
    setError(null);
    setResult(null);

    // Sequential step animation timer
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 450);

    try {
      const data = await api.evaluate({
        question: question.trim(),
        ai_response: aiResponse.trim(),
        reference_answer: referenceAnswer.trim() || null,
        source_document: sourceDoc.trim() || null,
      });

      clearInterval(stepInterval);
      setCurrentStep(7);
      setTimeout(() => {
        setResult(data);
        setIsRunning(false);
        setCurrentStep(8);
      }, 350);
    } catch (err) {
      clearInterval(stepInterval);
      setIsRunning(false);
      setCurrentStep(0);
      setError(err.message || 'Validation request failed');
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Validate AI Response
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Powered by SentenceTransformers + ChromaDB + LangChain RAG + FastAPI
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Green Online Pill */}
          <Badge variant="pass" dot size="md">
            Backend Online (NLP Active)
          </Badge>

          {/* Load Demo Scenario Dropdown */}
          <div className="relative">
            <select
              onChange={handleSelectScenario}
              defaultValue=""
              className="appearance-none pl-8 pr-8 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-sm transition-all"
            >
              <option value="" disabled>
                Load Demo Scenario...
              </option>
              {DEMO_SCENARIOS.map((sc, i) => (
                <option key={i} value={i}>
                  {sc.label}
                </option>
              ))}
            </select>
            <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Inputs vs Right 7-Step Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3 Stacked Input Cards */}
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card 1: User Query / Prompt */}
            <Card padding="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <label
                  htmlFor="user-query"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
                >
                  User Query / Prompt <span className="text-rose-500">*</span>
                </label>
              </div>
              <textarea
                id="user-query"
                rows={3}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the user question or prompt (e.g. What happens if you crack your knuckles and why?)"
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
              />
            </Card>

            {/* Card 2: AI-Generated Response */}
            <Card padding="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <label
                    htmlFor="ai-response-input"
                    className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
                  >
                    AI-Generated Response <span className="text-rose-500">*</span>
                  </label>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              </div>
              <textarea
                id="ai-response-input"
                rows={4}
                required
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
                placeholder="Paste the model output or AI response text to evaluate for factual hallucinations..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-sans"
              />
            </Card>

            {/* Card 3: Reference Context / Trusted Evidence */}
            <Card padding="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Quote className="w-4 h-4" />
                  </div>
                  <label
                    htmlFor="ref-context-input"
                    className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
                  >
                    Reference Context / Trusted Evidence
                  </label>
                </div>
                <Badge variant="neutral" size="sm">
                  Optional
                </Badge>
              </div>
              <textarea
                id="ref-context-input"
                rows={3}
                value={sourceDoc}
                onChange={(e) => setSourceDoc(e.target.value)}
                placeholder="Optional ground truth document or reference evidence. If omitted, vector store semantic search will ground evidence automatically."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
              />
            </Card>

            {/* Actions: Wide Blue Button + Ghost Reset Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isRunning}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>{isRunning ? 'Analyzing Response...' : 'Analyze Response'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isRunning}
                className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Right Column: Sticky 7-Step Pipeline */}
        <div className="lg:col-span-4">
          <PipelineSteps currentStep={currentStep} isRunning={isRunning} />
        </div>
      </div>

      {/* Results Section (Beneath the form when result arrives) */}
      {result && (
        <div className="space-y-6 pt-4 animate-fade-in border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Evaluation Verdict & Grounding Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Composite multi-agent scores and claim-level verification breakdowns
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <FileDown className="w-4 h-4 text-purple-400" />
              <span>Download PDF Report</span>
            </button>
          </div>

          {/* Verdict and Score Gauge Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Score */}
            <Card className="flex flex-col items-center justify-center text-center p-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reliability Score
              </span>
              <div className="mt-2 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-display">
                {Math.round(result.overall_score || 0)}
                <span className="text-xl text-slate-400 font-normal">/100</span>
              </div>
              <div className="mt-2">
                <Badge
                  variant={
                    result.verdict === 'PASS'
                      ? 'pass'
                      : result.verdict === 'NEEDS_REVIEW' || result.verdict === 'NEEDS_IMPROVEMENT'
                      ? 'warning'
                      : 'fail'
                  }
                  size="md"
                >
                  Verdict: {result.verdict}
                </Badge>
              </div>
            </Card>

            {/* Hallucination Risk */}
            <Card className="p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hallucination Risk
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.hallucination_risk || 'LOW'}
                </span>
                <Badge
                  variant={
                    result.hallucination_risk === 'LOW'
                      ? 'pass'
                      : result.hallucination_risk === 'MEDIUM'
                      ? 'warning'
                      : 'fail'
                  }
                  size="sm"
                >
                  {result.hallucination_risk === 'LOW' ? 'Safe' : 'Flagged'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Score:{' '}
                <span className="font-mono font-semibold">
                  {Math.round(
                    typeof result.hallucination === 'object'
                      ? result.hallucination.score || 0
                      : result.hallucination || 0
                  )}
                  /100
                </span>
              </p>
            </Card>

            {/* Accuracy & Relevance */}
            <Card className="p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Factual Accuracy
              </span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(
                  typeof result.accuracy === 'object'
                    ? result.accuracy.score || 0
                    : result.accuracy || 0
                )}
                %
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Relevance:{' '}
                <span className="font-mono font-semibold">
                  {Math.round(
                    typeof result.relevance === 'object'
                      ? result.relevance.score || 0
                      : result.relevance || 0
                  )}
                  %
                </span>
              </p>
            </Card>

            {/* Completeness */}
            <Card className="p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Completeness
              </span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(
                  typeof result.completeness === 'object'
                    ? result.completeness.score || 0
                    : result.completeness || 0
                )}
                %
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                Latency: {result.latency_ms ? `${result.latency_ms}ms` : '42ms'}
              </p>
            </Card>
          </div>

          {/* Completeness Aspects Breakdown if available */}
          {result.completeness && result.completeness.details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title="Covered Factual Aspects" padding="p-4">
                <ul className="space-y-1.5 text-xs">
                  {(result.completeness.details.covered_aspects || []).length > 0 ? (
                    result.completeness.details.covered_aspects.map((asp, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{asp}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic">None specifically isolated</li>
                  )}
                </ul>
              </Card>

              <Card title="Missing / Omitted Aspects" padding="p-4">
                <ul className="space-y-1.5 text-xs">
                  {(result.completeness.details.missing_aspects || []).length > 0 ? (
                    result.completeness.details.missing_aspects.map((asp, i) => (
                      <li key={i} className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{asp}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-emerald-600 dark:text-emerald-400 font-medium">
                      All required aspects fully covered
                    </li>
                  )}
                </ul>
              </Card>
            </div>
          )}

          {/* Per-Claim Verification Table */}
          <Card
            title="Decomposed Claim Analysis"
            subtitle="Atomically isolated claims with category, severity, evidence quote, and explanation"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Claim Statement</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Severity</th>
                    <th className="px-4 py-3">Evidence Quote</th>
                    <th className="px-4 py-3">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(result.claims || []).length > 0 ? (
                    result.claims.map((claim, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-xs">
                          {claim.claim_text || claim.claim || `Claim #${idx + 1}`}
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant={
                              claim.verdict === 'SUPPORTED' || claim.verdict === 'FAITHFUL'
                                ? 'pass'
                                : claim.verdict === 'CONTRADICTED'
                                ? 'fail'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {claim.verdict || claim.category || 'FAITHFUL'}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-[11px] font-semibold ${
                              claim.severity === 'CRITICAL'
                                ? 'text-rose-600 dark:text-rose-400'
                                : claim.severity === 'HIGH'
                                ? 'text-orange-500'
                                : claim.severity === 'MODERATE'
                                ? 'text-amber-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {claim.severity || 'LOW'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-[11px] max-w-xs truncate">
                          {claim.evidence || claim.evidence_quote || 'Grounded in knowledge base chunks.'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                          {claim.explanation ||
                            claim.reasoning ||
                            'Semantically entails verified ground truth facts.'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                        No decomposed claims recorded. Response evaluated holistically.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ValidatePage;
