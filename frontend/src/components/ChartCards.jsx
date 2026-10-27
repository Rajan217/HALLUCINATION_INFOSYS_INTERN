import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import Card from './Card';

// 1. Reliability Line Chart
export const ReliabilityLineChart = ({ data = [] }) => {
  const defaultData = [
    { name: '#1', reliability: 88, hallucination: 12 },
    { name: '#2', reliability: 92, hallucination: 8 },
    { name: '#3', reliability: 65, hallucination: 35 },
    { name: '#4', reliability: 84, hallucination: 16 },
    { name: '#5', reliability: 78, hallucination: 22 },
    { name: '#6', reliability: 95, hallucination: 5 },
    { name: '#7', reliability: 90, hallucination: 10 },
    { name: '#8', reliability: 86, hallucination: 14 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <Card
      title="Response Reliability Over Time"
      subtitle="Sequential evaluations score tracking"
      className="w-full"
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="reliability"
              name="Reliability Score"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="hallucination"
              name="Hallucination %"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2.5, fill: '#ef4444' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// 2. Claim Classification Donut Chart
export const ClaimDonutChart = ({
  supported = 68,
  contradicted = 14,
  unsupported = 18,
}) => {
  const data = [
    { name: 'Supported', value: supported, color: '#10b981' },
    { name: 'Contradicted', value: contradicted, color: '#ef4444' },
    { name: 'Unsupported', value: unsupported, color: '#f59e0b' },
  ];

  return (
    <Card
      title="Claim Classification"
      subtitle="Factual grounding breakdown across claims"
      className="w-full"
    >
      <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// 3. Evaluation Score Distribution Bar Chart
export const ScoreDistributionBarChart = ({ distribution = null }) => {
  const defaultDist = [
    { category: 'Highly Reliable (90+)', count: 42, fill: '#10b981' },
    { category: 'Mostly Reliable (75-89)', count: 28, fill: '#3b82f6' },
    { category: 'Needs Verification (50-74)', count: 14, fill: '#f59e0b' },
    { category: 'High Risk (<50)', count: 6, fill: '#ef4444' },
  ];

  const chartData = distribution || defaultDist;

  return (
    <Card
      title="Evaluation Score Distribution"
      subtitle="Distribution across 4 reliability buckets"
      className="w-full"
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis
              dataKey="category"
              stroke="#94a3b8"
              fontSize={10}
              interval={0}
              angle={-10}
              textAnchor="end"
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" name="Evaluations" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
