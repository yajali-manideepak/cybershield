import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { aggregateThreatTypes } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface ThreatTypeChartProps {
  incidents: Incident[];
}

export const ThreatTypeChart: React.FC<ThreatTypeChartProps> = ({ incidents }) => {
  const data = aggregateThreatTypes(incidents);

  // Gradient colors by rank
  const getBarColor = (index: number) => {
    if (index === 0) return '#EF4444'; // Top threat
    if (index === 1) return '#F97316';
    if (index < 4) return '#FACC15';
    return '#38BDF8';
  };

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART B: THREAT TYPE DISTRIBUTION
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Ranked by simulated incident frequency (Descending)
          </p>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {data.length} Types
        </span>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No threat data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2D4A" />
              <XAxis
                type="number"
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#CBD5E1' }}
                tickLine={false}
                width={110}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                        <div className="font-semibold text-white mb-1">{d.type}</div>
                        <div className="text-cyan-400 font-mono">
                          Count: <span className="font-bold">{d.count}</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[10px]">
                          Percentage: {d.pct}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
