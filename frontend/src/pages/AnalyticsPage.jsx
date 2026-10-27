import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { ScoreDistributionBarChart } from '../components/ChartCards';
import DataTable from '../components/DataTable';
import { api } from '../services/api';

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [records, setRecords] = useState([
    {
      id: 'eval_101',
      date: '2026-10-22 18:20',
      engine: 'GPT-4o',
      query: 'What happens if you crack your knuckles and why?',
      claims: 2,
      hallucinations: 1,
      score: 34,
      verdict: 'FAIL',
      details: {
        ai_response:
          'Cracking your knuckles causes severe osteoarthritis in 100% of people because it destroys cartilage.',
        risk: 'HIGH',
        completeness: 40,
        accuracy: 25,
        relevance: 90,
      },
    },
    {
      id: 'eval_102',
      date: '2026-10-22 17:45',
      engine: 'Claude-3.5',
      query: 'When was Super Bowl 50 played and who won?',
      claims: 2,
      hallucinations: 0,
      score: 96,
      verdict: 'PASS',
      details: {
        ai_response:
          'Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10.',
        risk: 'LOW',
        completeness: 98,
        accuracy: 96,
        relevance: 98,
      },
    },
    {
      id: 'eval_103',
      date: '2026-10-22 16:30',
      engine: 'Llama-3',
      query: 'Who was the first person to walk on the moon?',
      claims: 3,
      hallucinations: 0,
      score: 92,
      verdict: 'PASS',
      details: {
        ai_response:
          'Neil Armstrong walked on the moon on July 20, 1969, during the Apollo 11 mission.',
        risk: 'LOW',
        completeness: 95,
        accuracy: 94,
        relevance: 95,
      },
    },
    {
      id: 'eval_104',
      date: '2026-10-22 15:15',
      engine: 'Gemini-1.5',
      query: 'What is the speed of light in vacuum?',
      claims: 1,
      hallucinations: 0,
      score: 98,
      verdict: 'PASS',
      details: {
        ai_response: 'The speed of light in vacuum is approximately 299,792,458 meters per second.',
        risk: 'LOW',
        completeness: 100,
        accuracy: 99,
        relevance: 98,
      },
    },
    {
      id: 'eval_105',
      date: '2026-10-22 14:00',
      engine: 'Mistral-Large',
      query: 'Explain the cause of aurora borealis and list 2 locations.',
      claims: 3,
      hallucinations: 0,
      score: 82,
      verdict: 'PASS',
      details: {
        ai_response:
          'Charged solar particles collide with atmospheric gases. Visible in Norway and Alaska.',
        risk: 'LOW',
        completeness: 85,
        accuracy: 88,
        relevance: 82,
      },
    },
    {
      id: 'eval_106',
      date: '2026-10-22 12:40',
      engine: 'GPT-4o',
      query: 'Did Thomas Edison invent the electric light bulb alone?',
      claims: 2,
      hallucinations: 1,
      score: 58,
      verdict: 'FLAG',
      details: {
        ai_response:
          'Thomas Edison created the very first incandescent lamp completely independently without prior patents.',
        risk: 'MEDIUM',
        completeness: 60,
        accuracy: 55,
        relevance: 80,
      },
    },
  ]);

  // Load backend evaluations if available
  useEffect(() => {
    const loadRealEvaluations = async () => {
      try {
        const evals = await api.getEvaluations(50);
        if (evals && evals.length > 0) {
          const mapped = evals.map((item, idx) => ({
            id: item.id || `eval_${idx + 1}`,
            date: item.timestamp ? new Date(item.timestamp).toISOString().slice(0, 16).replace('T', ' ') : '2026-10-22 18:00',
            engine: item.engine || 'VeriAI-v3',
            query: item.input_data?.question || item.question || 'Query',
            claims: (item.claims || []).length || 2,
            hallucinations: item.hallucination_risk === 'HIGH' ? 1 : 0,
            score: Math.round(item.overall_score || 85),
            verdict: item.verdict || 'PASS',
            details: {
              ai_response: item.input_data?.ai_response || item.ai_response || '',
              risk: item.hallucination_risk || 'LOW',
              completeness: Math.round(item.completeness?.score || 80),
              accuracy: Math.round(item.accuracy?.score || 80),
              relevance: Math.round(item.relevance?.score || 85),
            },
          }));
          setRecords(mapped);
        }
      } catch {
        // Keep default records
      }
    };
    loadRealEvaluations();
  }, []);

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      width: '130px',
      render: (r) => <span className="font-mono text-slate-400 text-[11px]">{r.date}</span>,
    },
    {
      header: 'Engine',
      accessor: 'engine',
      width: '100px',
      render: (r) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
          {r.engine}
        </span>
      ),
    },
    {
      header: 'Query',
      accessor: 'query',
      render: (r) => (
        <span className="font-medium text-slate-900 dark:text-white line-clamp-1">{r.query}</span>
      ),
    },
    {
      header: 'Claims',
      accessor: 'claims',
      width: '70px',
      render: (r) => <span className="font-mono text-center block">{r.claims}</span>,
    },
    {
      header: 'Hallucinations',
      accessor: 'hallucinations',
      width: '110px',
      render: (r) => (
        <span
          className={`font-mono font-bold ${
            r.hallucinations > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {r.hallucinations} detected
        </span>
      ),
    },
    {
      header: 'Score',
      accessor: 'score',
      width: '90px',
      render: (r) => {
        const color =
          r.score >= 85
            ? 'text-emerald-600 dark:text-emerald-400'
            : r.score >= 60
            ? 'text-amber-500'
            : 'text-rose-600 dark:text-rose-400';
        return <span className={`font-mono font-bold text-xs ${color}`}>{r.score}/100</span>;
      },
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
              : r.verdict === 'FLAG' || r.verdict === 'NEEDS_REVIEW'
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
      header: 'Details',
      width: '80px',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRecord(r);
          }}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline font-semibold text-xs inline-flex items-center gap-1"
        >
          <span>Inspect</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Evaluation & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aggregated distributions, categorical risk stratification, and single-evaluation audit logs
        </p>
      </div>

      {/* Bar Chart: Score Distribution */}
      <ScoreDistributionBarChart />

      {/* Table: Single Evaluation Records */}
      <Card title="Single Evaluation Records" subtitle="Click on any row or select Inspect to view multi-agent details">
        <DataTable
          columns={columns}
          data={records}
          searchable={true}
          searchPlaceholder="Search by query, engine, or verdict..."
          searchKeys={['query', 'engine', 'verdict', 'score']}
          onRowClick={(row) => setSelectedRecord(row)}
        />
      </Card>

      {/* Inspect Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={
                  selectedRecord.verdict === 'PASS'
                    ? 'pass'
                    : selectedRecord.verdict === 'FLAG'
                    ? 'warning'
                    : 'fail'
                }
                size="md"
              >
                {selectedRecord.verdict}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Record ID: {selectedRecord.id}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {selectedRecord.query}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-4 leading-relaxed font-sans">
              <span className="font-semibold block text-slate-500 mb-1">Model Response:</span>
              {selectedRecord.details?.ai_response}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Reliability
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedRecord.score}/100
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Risk Level
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedRecord.details?.risk}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Accuracy
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedRecord.details?.accuracy}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Completeness
                </span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedRecord.details?.completeness}%
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300"
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

export default AnalyticsPage;
