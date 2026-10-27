import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { api } from '../services/api';

export const HistoryPage = () => {
  const [items, setItems] = useState([
    {
      id: 'hist_001',
      date: '2026-10-22 18:14',
      question: 'What happens if you crack your knuckles and why?',
      engine: 'GPT-4o',
      score: 34,
      verdict: 'FAIL',
      risk: 'HIGH',
      response:
        'Cracking your knuckles causes severe osteoarthritis in 100% of people because it destroys cartilage.',
    },
    {
      id: 'hist_002',
      date: '2026-10-22 17:30',
      question: 'When was Super Bowl 50 played and who won?',
      engine: 'Claude-3.5',
      score: 96,
      verdict: 'PASS',
      risk: 'LOW',
      response:
        'Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10.',
    },
    {
      id: 'hist_003',
      date: '2026-10-22 16:15',
      question: 'Who was the first person to walk on the moon?',
      engine: 'Llama-3',
      score: 92,
      verdict: 'PASS',
      risk: 'LOW',
      response:
        'Neil Armstrong became the first human to step onto the lunar surface on July 20, 1969.',
    },
    {
      id: 'hist_004',
      date: '2026-10-22 14:50',
      question: 'What causes climate change and what are 3 ways to reduce emissions?',
      engine: 'Gemini-1.5',
      score: 68,
      verdict: 'NEEDS_REVIEW',
      risk: 'MEDIUM',
      response:
        'Emissions from combustion of coal and oil heat the earth. Solution includes switching to renewables.',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getEvaluations(100);
        if (data && data.length > 0) {
          const mapped = data.map((d, i) => ({
            id: d.id || `hist_${i + 1}`,
            date: d.timestamp
              ? new Date(d.timestamp).toISOString().slice(0, 16).replace('T', ' ')
              : '2026-10-22 18:00',
            question: d.input_data?.question || d.question || 'User Prompt',
            engine: d.engine || 'VeriAI-v3',
            score: Math.round(d.overall_score || 85),
            verdict: d.verdict || 'PASS',
            risk: d.hallucination_risk || 'LOW',
            response: d.input_data?.ai_response || d.ai_response || '',
          }));
          setItems(mapped);
        }
      } catch {
        // keep defaults
      }
    };
    loadData();
  }, []);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this validation audit log?')) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const filteredItems = items.filter((it) => {
    if (activeFilter === 'ALL') return true;
    return it.verdict === activeFilter;
  });

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'date',
      width: '130px',
      render: (r) => <span className="font-mono text-slate-400 text-[11px]">{r.date}</span>,
    },
    {
      header: 'Engine',
      accessor: 'engine',
      width: '90px',
      render: (r) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
          {r.engine}
        </span>
      ),
    },
    {
      header: 'Question / Query',
      accessor: 'question',
      render: (r) => (
        <span className="font-medium text-slate-900 dark:text-white line-clamp-1">
          {r.question}
        </span>
      ),
    },
    {
      header: 'Score',
      accessor: 'score',
      width: '80px',
      render: (r) => (
        <span
          className={`font-mono font-bold text-xs ${
            r.score >= 85
              ? 'text-emerald-600 dark:text-emerald-400'
              : r.score >= 60
              ? 'text-amber-500'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {r.score}/100
        </span>
      ),
    },
    {
      header: 'Risk',
      accessor: 'risk',
      width: '90px',
      render: (r) => (
        <Badge
          variant={r.risk === 'LOW' ? 'pass' : r.risk === 'MEDIUM' ? 'warning' : 'fail'}
          size="sm"
        >
          {r.risk}
        </Badge>
      ),
    },
    {
      header: 'Verdict',
      accessor: 'verdict',
      width: '95px',
      render: (r) => (
        <Badge
          variant={
            r.verdict === 'PASS'
              ? 'pass'
              : r.verdict === 'NEEDS_REVIEW' || r.verdict === 'FLAG'
              ? 'warning'
              : 'fail'
          }
          size="sm"
        >
          {r.verdict}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      width: '110px',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedItem(r)}
            className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded"
            title="Inspect Details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
            title="Delete Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Validation History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of past individual and batch evaluation records
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {['ALL', 'PASS', 'NEEDS_REVIEW', 'FAIL'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <Card title={`Recorded Validations (${filteredItems.length})`}>
        <DataTable
          columns={columns}
          data={filteredItems}
          searchable={true}
          searchPlaceholder="Search history records..."
          searchKeys={['question', 'engine', 'verdict', 'risk']}
          onRowClick={(row) => setSelectedItem(row)}
        />
      </Card>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={
                  selectedItem.verdict === 'PASS'
                    ? 'pass'
                    : selectedItem.verdict === 'FAIL'
                    ? 'fail'
                    : 'warning'
                }
                size="md"
              >
                {selectedItem.verdict}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Score: {selectedItem.score}/100 • Risk: {selectedItem.risk}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {selectedItem.question}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              <span className="font-semibold block text-slate-500 mb-1">Response:</span>
              {selectedItem.response}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Audit Record</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
