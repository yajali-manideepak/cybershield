import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { aggregateSeverities } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface SeverityDonutChartProps {
  incidents: Incident[];
}

export const SeverityDonutChart: React.FC<SeverityDonutChartProps> = ({ incidents }) => {
  const data = aggregateSeverities(incidents);
  const total = incidents.length;

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART C: SEVERITY CLASSIFICATION
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Breakdown across standardized SOC triage tiers
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No severity data available
          </div>
        ) : (
          <>
            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-xl font-bold font-mono text-white">{total.toLocaleString()}</span>
              <span className="text-[10px] uppercase font-mono text-slate-400">Total</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {data.map((entry) => (
                    <Cell key={`sev-cell-${entry.name}`} fill={entry.color} stroke="#111C2F" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                            <span>{d.name} Severity</span>
                          </div>
                          <div className="text-cyan-400 font-mono">
                            Count: <span className="font-bold">{d.count}</span>
                          </div>
                          <div className="text-slate-400 font-mono text-[10px]">
                            Share: {d.pct}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-slate-300 font-medium ml-1">
                      {value} ({entry.payload.pct}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};
