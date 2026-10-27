import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Code2, Copy, Check } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

const CODE_SECTIONS = [
  {
    id: 'orchestrator',
    title: '1. Multi-Agent Orchestrator Pipeline',
    file: 'app/agents/orchestrator.py',
    explanation:
      'Coordinates the sequential evaluation workflow across Completeness, Accuracy, Relevance, and Hallucination agents, synthesizing timing and weighted scores.',
    code: `class EvaluationOrchestrator:
    def run_evaluation(self, req: EvaluationInputRequest) -> EvaluationVerdict:
        start_time = time.time()
        
        # 1. Completeness Assessment
        comp_score = self.completeness_judge.evaluate(req.question, req.ai_response)
        
        # 2. Factual Accuracy & Grounding
        acc_score = self.accuracy_judge.evaluate(req.question, req.ai_response, req.reference_answer)
        
        # 3. Contextual Relevance
        rel_score = self.relevance_judge.evaluate(req.question, req.ai_response)
        
        # 4. Decomposed Hallucination Detection
        hall_score = self.hallucination_detector.evaluate(req.ai_response, req.source_document)
        
        # 5. Verdict Synthesis
        verdict = self.verdict_agent.synthesize(comp_score, acc_score, rel_score, hall_score)
        verdict.latency_ms = int((time.time() - start_time) * 1000)
        return verdict`,
  },
  {
    id: 'completeness',
    title: '2. Completeness Judge Agent',
    file: 'app/agents/completeness_judge.py',
    explanation:
      'Extracts expected facets from questions and matches covered vs missing aspects in the AI response.',
    code: `class CompletenessJudgeAgent:
    def evaluate(self, question: str, response: str) -> AgentDimensionScore:
        sub_questions = self._extract_aspects(question)
        covered = []
        missing = []
        
        for aspect in sub_questions:
            if self._is_aspect_addressed(aspect, response):
                covered.append(aspect)
            else:
                missing.append(aspect)
                
        coverage_ratio = len(covered) / max(len(sub_questions), 1)
        score = coverage_ratio * 100.0
        
        return AgentDimensionScore(
            score=score,
            category="FULLY_COMPLETE" if coverage_ratio >= 0.8 else "PARTIALLY_COMPLETE",
            details={"covered_aspects": covered, "missing_aspects": missing}
        )`,
  },
  {
    id: 'hallucination',
    title: '3. Claim Decomposition & Hallucination Detector',
    file: 'app/agents/hallucination_detector.py',
    explanation:
      'Parses the AI response into atomic assertions and cross-checks them against vector embeddings or ground-truth context.',
    code: `class HallucinationDetectorAgent:
    def evaluate(self, response_text: str, context: Optional[str]) -> AgentDimensionScore:
        claims = self.claim_decomposer.decompose(response_text)
        evaluated_claims = []
        hallucination_count = 0
        
        for claim in claims:
            entailment = self._verify_claim(claim, context)
            if entailment.is_contradiction:
                hallucination_count += 1
                severity = "CRITICAL" if entailment.confidence > 0.8 else "HIGH"
            else:
                severity = "LOW"
                
            evaluated_claims.append({
                "claim_text": claim.text,
                "verdict": "CONTRADICTED" if entailment.is_contradiction else "SUPPORTED",
                "severity": severity,
                "evidence": entailment.matched_evidence
            })
            
        risk = "HIGH" if hallucination_count > 0 else "LOW"
        return AgentDimensionScore(score=100 - (hallucination_count * 35), category=risk, details={"claims": evaluated_claims})`,
  },
];

export const CodeWalkthroughPage = () => {
  const [openSection, setOpenSection] = useState('orchestrator');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Code Walkthrough
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Interactive source code inspection of core agents, algorithms, and synthesis logic
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {CODE_SECTIONS.map((sec) => {
          const isOpen = openSection === sec.id;

          return (
            <Card key={sec.id} padding="p-0" className="overflow-hidden">
              {/* Header Toggle */}
              <button
                onClick={() => setOpenSection(isOpen ? null : sec.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                      {sec.title}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-400">
                      {sec.file}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 hidden sm:block">
                    {isOpen ? 'Collapse' : 'Expand Code'}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {sec.explanation}
                  </p>

                  <div className="relative rounded-xl bg-[#090d16] border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                      <span>Python 3.10+ • Static AST Inspection</span>
                      <button
                        onClick={() => handleCopy(sec.id, sec.code)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        {copiedId === sec.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed">
                      <code>{sec.code}</code>
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CodeWalkthroughPage;
