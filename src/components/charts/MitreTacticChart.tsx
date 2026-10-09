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
import { aggregateMitreTactics } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface MitreTacticChartProps {
  incidents: Incident[];
}

export const MitreTacticChart: React.FC<MitreTacticChartProps> = ({ incidents }) => {
  const data = aggregateMitreTactics(incidents);

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART E: MITRE ATT&CK TACTIC ANALYSIS
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulated framework alignment (Illustrative mappings in synthetic dataset)
          </p>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {data.length} Tactics
        </span>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No MITRE tactic data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
              <XAxis
                dataKey="tactic"
                stroke="#64748B"
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                angle={-25}
                textAnchor="end"
                interval={0}
                tickLine={false}
              />
              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                        <div className="font-semibold text-white mb-0.5">{d.tactic}</div>
                        <div className="text-indigo-400 font-mono">
                          Count: <span className="font-bold">{d.count}</span> incidents
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 italic">
                          Illustrative MITRE ATT&CK enterprise mapping
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`tactic-${index}`}
                    fill={index % 2 === 0 ? '#6366F1' : '#818CF8'}
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
