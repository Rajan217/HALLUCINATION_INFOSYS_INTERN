import React from 'react';
import { CheckCircle2, Loader2, Circle, Clock } from 'lucide-react';
import Card from './Card';

export const PIPELINE_STEPS = [
  { id: 1, name: 'Parsing AI Response', desc: 'Decomposing response structure & entities' },
  { id: 2, name: 'Extracting Factual Claims', desc: 'Isolating verifiable factual assertions' },
  { id: 3, name: 'Searching Evidence', desc: 'Querying ChromaDB vector store & source doc' },
  { id: 4, name: 'Semantic Consistency Check', desc: 'Running NLI contradiction & entailment scoring' },
  { id: 5, name: 'Calculating Confidence', desc: 'Synthesizing multi-agent completeness & relevance' },
  { id: 6, name: 'Detecting Hallucinations', desc: 'Evaluating claim veracity & risk levels' },
  { id: 7, name: 'Generating Validation Report', desc: 'Aggregating weighted score & verdict synthesis' },
];

export const PipelineSteps = ({
  currentStep = 0, // 0 = idle, 1..7 = active step, 8 = all completed
  isRunning = false,
  className = '',
}) => {
  return (
    <Card
      title="Validation Pipeline"
      subtitle="Multi-agent orchestration workflow"
      className={`sticky top-20 ${className}`}
      headerAction={
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {isRunning ? `${Math.min(currentStep, 7)}/7 Active` : currentStep > 7 ? '7/7 Complete' : 'Idle'}
        </span>
      }
    >
      <div className="space-y-4">
        {PIPELINE_STEPS.map((step) => {
          const isDone = currentStep > step.id || (currentStep >= 7 && !isRunning && currentStep !== 0);
          const isActive = isRunning && currentStep === step.id;
          const isPending = !isDone && !isActive;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 transition-all duration-200 ${
                isPending ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Step Circle Indicator */}
              <div className="pt-0.5 shrink-0">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : isActive ? (
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-spin">
                    <Loader2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[11px] font-mono">
                    {step.id}
                  </div>
                )}
              </div>

              {/* Step Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : isDone
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-500'
                    }`}
                  >
                    {step.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {step.id}/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isRunning && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          <span>Synthesizing agent verdicts across knowledge base...</span>
        </div>
      )}
    </Card>
  );
};

export default PipelineSteps;
