import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { aggregateThreatTypeVsSeverity } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface ThreatTypeVsSeverityChartProps {
  incidents: Incident[];
}

export const ThreatTypeVsSeverityChart: React.FC<ThreatTypeVsSeverityChartProps> = ({ incidents }) => {
  const data = aggregateThreatTypeVsSeverity(incidents);

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART H: THREAT CATEGORY VERSUS SEVERITY BREAKDOWN
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Stacked volume of severity classifications across each attack type
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No threat vs severity data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 15, left: -15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
              <XAxis
                dataKey="threat"
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
                    return (
                      <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white border-b border-[#1E2D4A] pb-1 mb-1">
                          {label} (Total: {total})
                        </div>
                        {payload.map((p: any) => (
                          <div key={p.name} className="flex items-center justify-between gap-4 font-mono text-[11px]">
                            <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                              {p.name}:
                            </span>
                            <span className="text-white font-bold">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '8px' }}
                iconType="circle"
                formatter={(val) => <span className="text-[11px] text-slate-300 ml-1">{val}</span>}
              />
              <Bar dataKey="Low" stackId="a" fill="#38BDF8" />
              <Bar dataKey="Medium" stackId="a" fill="#FACC15" />
              <Bar dataKey="High" stackId="a" fill="#F97316" />
              <Bar dataKey="Critical" stackId="a" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
