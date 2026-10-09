import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HourlyAttackPattern } from '../../utils/threatAnalytics';
import { Moon, Sun, Clock } from 'lucide-react';

interface DiurnalHourlyChartProps {
  data: HourlyAttackPattern[];
}

export const DiurnalHourlyChart: React.FC<DiurnalHourlyChartProps> = ({ data }) => {
  const offHoursCount = data.filter(d => d.isOffHours).reduce((sum, d) => sum + d.count, 0);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const offHoursPct = Math.round((offHoursCount / totalCount) * 100);

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[380px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              24-HOUR DIURNAL ATTACK DENSITY
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Temporal rhythm across 24 hourly buckets (Identifies off-hours & night compromise spikes)
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800">
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>Off-Hours: {offHoursPct}%</span>
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="hourlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
            <XAxis
              dataKey="hourLabel"
              stroke="#64748B"
              tick={{ fontSize: 9.5, fill: '#94A3B8' }}
              tickLine={false}
              interval={2}
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
                  const d = payload[0].payload as HourlyAttackPattern;
                  return (
                    <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3 font-mono font-bold text-white border-b border-[#1E2D4A] pb-1">
                        <span>Window: {d.hourLabel}</span>
                        {d.isOffHours ? (
                          <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-normal">
                            <Moon className="w-2.5 h-2.5" /> Night Shift
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-normal">
                            <Sun className="w-2.5 h-2.5" /> Business Hours
                          </span>
                        )}
                      </div>
                      <div className="text-cyan-400 font-mono">
                        Incidents: <span className="font-bold">{d.count}</span>
                      </div>
                      <div className="text-rose-400 font-mono text-[11px]">
                        Critical Cases: <span className="font-bold">{d.criticalCount}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#06B6D4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#hourlyAreaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
