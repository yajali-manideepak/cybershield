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
import { AttackVectorBreakdown } from '../../utils/threatAnalytics';
import { Radio } from 'lucide-react';

interface AttackVectorBarChartProps {
  data: AttackVectorBreakdown[];
}

export const AttackVectorBarChart: React.FC<AttackVectorBarChartProps> = ({ data }) => {
  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[380px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              INGRESS ATTACK VECTOR RANKING
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Initial entry pathways leveraged across simulated incidents
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono bg-[#0D1525] px-2 py-0.5 rounded border border-[#1E2D4A] shrink-0">
          {data.length} Vectors
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 25, left: 25, bottom: 5 }}
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
              dataKey="vector"
              stroke="#64748B"
              tick={{ fontSize: 10, fill: '#CBD5E1' }}
              tickLine={false}
              width={125}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as AttackVectorBreakdown;
                  return (
                    <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <div className="font-bold text-white border-b border-[#1E2D4A] pb-1">
                        Vector: {d.vector}
                      </div>
                      <div className="text-amber-400 font-mono">
                        Incidents: <span className="font-bold">{d.count}</span> ({d.pct}% share)
                      </div>
                      <div className="text-rose-400 font-mono text-[11px]">
                        Critical Triage: <span className="font-bold">{d.criticalCount}</span> cases
                      </div>
                      <div className="text-slate-400 text-[10px] pt-1">
                        Primary Threat Association: <span className="text-cyan-300 font-medium">{d.topThreat}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={`vec-cell-${i}`} fill={i === 0 ? '#F59E0B' : '#EAB308'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
