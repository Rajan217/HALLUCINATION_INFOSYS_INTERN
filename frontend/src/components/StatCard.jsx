import React from 'react';
import Card from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  icon: Icon,
  iconColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
  label,
  value,
  delta,
  deltaType = 'positive', // 'positive' | 'negative' | 'neutral'
  subtext,
  className = '',
}) => {
  return (
    <Card hover className={`${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>

          {(delta || subtext) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {delta && (
                <span
                  className={`inline-flex items-center font-medium ${
                    deltaType === 'positive'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : deltaType === 'negative'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {deltaType === 'positive' && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                  {deltaType === 'negative' && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                  {deltaType === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                  {delta}
                </span>
              )}
              {subtext && (
                <span className="text-slate-400 dark:text-slate-500">
                  {subtext}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
