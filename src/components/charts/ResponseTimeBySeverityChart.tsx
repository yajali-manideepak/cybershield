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
import { aggregateResponseTimeBySeverity } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface ResponseTimeBySeverityChartProps {
  incidents: Incident[];
}

export const ResponseTimeBySeverityChart: React.FC<ResponseTimeBySeverityChartProps> = ({ incidents }) => {
  const data = aggregateResponseTimeBySeverity(incidents);

  const colors: Record<string, string> = {
    Low: '#38BDF8',
    Medium: '#FACC15',
    High: '#F97316',
    Critical: '#EF4444',
  };

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART G: RESPONSE TIME BY SEVERITY
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Average response duration (minutes) across triage levels
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
            <XAxis
              dataKey="severity"
              stroke="#64748B"
              tick={{ fontSize: 11, fill: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickLine={false}
              unit="m"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[d.severity] }}></span>
                        <span>{d.severity} Severity</span>
                      </div>
                      <div className="text-amber-400 font-mono">
                        Avg Time: <span className="font-bold">{d.avgMinutes} minutes</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        Incidents: {d.incidentCount}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="avgMinutes" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={`sev-resp-${entry.severity}`} fill={colors[entry.severity] || '#38BDF8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
