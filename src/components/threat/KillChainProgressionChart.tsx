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
import { KillChainPhase } from '../../utils/threatAnalytics';
import { Layers, ArrowRight } from 'lucide-react';

interface KillChainProgressionChartProps {
  data: KillChainPhase[];
}

export const KillChainProgressionChart: React.FC<KillChainProgressionChartProps> = ({ data }) => {
  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[380px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              MITRE ATT&CK KILL-CHAIN PROGRESSION
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Simulated attack vector progression across chronological tactical phases
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono bg-[#0D1525] px-2 py-0.5 rounded border border-[#1E2D4A] shrink-0">
          7 Lifecycle Tiers
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, left: -15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
            <XAxis
              dataKey="phase"
              stroke="#64748B"
              tick={{ fontSize: 9.5, fill: '#CBD5E1' }}
              angle={-20}
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
                  const d = payload[0].payload as KillChainPhase;
                  return (
                    <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <div className="font-bold text-white border-b border-[#1E2D4A] pb-1">
                        Phase: {d.phase}
                      </div>
                      <div className="text-cyan-400 font-mono">
                        Incidents: <span className="font-bold">{d.count}</span> ({d.pct}% of active)
                      </div>
                      <div className="text-rose-400 font-mono text-[11px]">
                        Critical Triage: <span className="font-bold">{d.criticalCount}</span> cases
                      </div>
                      <div className="text-amber-400 font-mono text-[11px]">
                        Mean Risk: <span className="font-bold">{d.avgRisk}%</span>
                      </div>
                      <div className="text-slate-400 text-[10px] pt-1">
                        Predominant Threat: <span className="text-indigo-300 font-medium">{d.topThreat}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={`kc-${i}`}
                  fill={i === 0 ? '#38BDF8' : i === 1 ? '#6366F1' : i === data.length - 1 ? '#EF4444' : '#818CF8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Progression Badges */}
      <div className="hidden md:flex items-center justify-between pt-2 border-t border-[#1E2D4A]/60 text-[10px] text-slate-400 font-mono overflow-x-auto">
        {data.map((p, idx) => (
          <React.Fragment key={p.phase}>
            <span className="truncate px-1 hover:text-white transition-colors" title={`${p.phase}: ${p.count} events`}>
              {p.phase}
            </span>
            {idx < data.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
