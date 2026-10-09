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
import { aggregateStatuses } from '../../utils/analytics';
import { Incident } from '../../types/incident';

interface IncidentStatusChartProps {
  incidents: Incident[];
}

export const IncidentStatusChart: React.FC<IncidentStatusChartProps> = ({ incidents }) => {
  const data = aggregateStatuses(incidents);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Blocked':
        return '#38BDF8'; // Sky blue
      case 'Contained':
        return '#22C55E'; // Green
      case 'Resolved':
        return '#10B981'; // Emerald
      case 'Investigating':
        return '#FACC15'; // Yellow
      case 'Escalated':
        return '#EF4444'; // Red
      case 'False Positive':
        return '#94A3B8'; // Slate
      default:
        return '#6366F1';
    }
  };

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CHART D: INCIDENT STATUS LIFECYCLE
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Containment, escalation & investigation states
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No status data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
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
                dataKey="status"
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
                        <div className="font-semibold text-white mb-1">{d.status}</div>
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
                {data.map((entry) => (
                  <Cell key={`status-cell-${entry.status}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
