import React, { useState } from 'react';
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
import { aggregateGeographicDistribution } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface GeographicSourceChartProps {
  incidents: Incident[];
}

export const GeographicSourceChart: React.FC<GeographicSourceChartProps> = ({ incidents }) => {
  const [mode, setMode] = useState<'region' | 'country'>('region');
  const data = aggregateGeographicDistribution(incidents, mode);

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART F: GEOGRAPHIC SOURCE DISTRIBUTION
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulated geographic origin (Synthetic tags, not verified attribution)
          </p>
        </div>

        {/* Region vs Country Toggle */}
        <div className="flex items-center bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-0.5 text-[11px]">
          <button
            onClick={() => setMode('region')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              mode === 'region'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Region
          </button>
          <button
            onClick={() => setMode('country')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              mode === 'country'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Country
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No geographic data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.slice(0, 10)}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
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
                dataKey="name"
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#CBD5E1' }}
                tickLine={false}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                        <div className="font-semibold text-white mb-1">{d.name}</div>
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
              <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]}>
                {data.slice(0, 10).map((_, index) => (
                  <Cell
                    key={`geo-${index}`}
                    fill={index === 0 ? '#38BDF8' : '#0284C7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
