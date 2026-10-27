import React, { useState } from 'react';
import {
  Settings,
  User,
  Sliders,
  Database,
  Key,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export const SettingsPage = () => {
  const [name, setName] = useState('Infosys Intern Researcher');
  const [email, setEmail] = useState('researcher@veriai.intern');
  const [modelEngine, setModelEngine] = useState('all-MiniLM-L6-v2');
  const [hallucinationThreshold, setHallucinationThreshold] = useState(70);
  const [completenessThreshold, setCompletenessThreshold] = useState(80);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    if (confirm('Clear local evaluation cache and benchmark seeds?')) {
      alert('Local evaluation cache cleared successfully.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Account & Engine Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure model thresholds, local vector store paths, and researcher profile
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <Card title="Researcher Profile" subtitle="Account credentials and institutional affiliations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>
        </Card>

        {/* Evaluation Thresholds */}
        <Card title="Agent Scoring Thresholds" subtitle="Configure sensitivity parameters for PASS / FLAG / FAIL classifications">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Hallucination Detection Sensitivity
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {hallucinationThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value={hallucinationThreshold}
                onChange={(e) => setHallucinationThreshold(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Scores below this threshold trigger a HIGH risk critical alert.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Completeness Passing Threshold
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {completenessThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={completenessThreshold}
                onChange={(e) => setCompletenessThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Percentage of user prompt sub-aspects required for FULLY_COMPLETE verdict.
              </p>
            </div>
          </div>
        </Card>

        {/* Database & Vector Store Settings */}
        <Card title="Vector Store & Inference Provider" subtitle="ChromaDB and local NLP model configs">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SentenceTransformer Embedding Model
              </label>
              <select
                value={modelEngine}
                onChange={(e) => setModelEngine(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (Default, Ultra-Fast CPU)</option>
                <option value="all-mpnet-base-v2">all-mpnet-base-v2 (Higher Accuracy)</option>
                <option value="paraphrase-multilingual-MiniLM-L12-v2">paraphrase-multilingual-MiniLM-L12-v2</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                ChromaDB Persistence: data/vector_store/chroma.sqlite3
              </span>
              <button
                type="button"
                onClick={handleClearCache}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                Clear Local Storage Cache
              </button>
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
