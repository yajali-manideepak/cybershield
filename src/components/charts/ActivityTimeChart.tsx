import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { aggregateActivityOverTime } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface ActivityTimeChartProps {
  incidents: Incident[];
}

export const ActivityTimeChart: React.FC<ActivityTimeChartProps> = ({ incidents }) => {
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>('daily');

  const data = aggregateActivityOverTime(incidents, granularity);

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART A: INCIDENT ACTIVITY OVER TIME
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Temporal distribution of detection timestamps ({data.length} data points)
          </p>
        </div>

        {/* Toggle Daily vs Monthly */}
        <div className="flex items-center bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-0.5 text-[11px]">
          <button
            onClick={() => setGranularity('daily')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              granularity === 'daily'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setGranularity('monthly')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              granularity === 'monthly'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No temporal data for active filters
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                        <div className="text-slate-400 font-mono text-[10px] mb-1">{label}</div>
                        <div className="text-cyan-400 font-bold">
                          {payload[0].value} <span className="text-slate-300 font-normal">Incidents Logged</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="incidents"
                stroke="#38BDF8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyberAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
