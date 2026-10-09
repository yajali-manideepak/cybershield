import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ThreatScatterPoint } from '../../utils/threatAnalytics';
import { AlertTriangle, Crosshair } from 'lucide-react';

interface ThreatRiskScatterChartProps {
  data: ThreatScatterPoint[];
  onSelectThreat?: (threat: string) => void;
  selectedThreat?: string;
}

export const ThreatRiskScatterChart: React.FC<ThreatRiskScatterChartProps> = ({
  data,
  onSelectThreat,
  selectedThreat,
}) => {
  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              THREAT SPECTRUM: RISK SCORE VS. IMPACT MAGNITUDE
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            2D Risk Matrix (X: Avg Risk Score 0–100% • Y: Impact Score 1–10 • Bubble Size: Incident Volume)
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono bg-[#0D1525] px-2 py-0.5 rounded border border-[#1E2D4A] shrink-0">
          Click any threat bubble to inspect
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No incident data matching active filters
          </div>
        ) : (
          <>
            {/* Quadrant Legend Markers in Background */}
            <div className="absolute top-2 right-4 pointer-events-none text-[10px] font-mono text-rose-400/50 uppercase tracking-wider font-semibold z-0">
              Critical Hazard Zone ↗
            </div>
            <div className="absolute bottom-8 left-16 pointer-events-none text-[10px] font-mono text-cyan-400/40 uppercase tracking-wider font-semibold z-0">
              ↙ Routine / Contained
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis
                  type="number"
                  dataKey="avgRisk"
                  name="Risk Score"
                  unit="%"
                  domain={[0, 100]}
                  stroke="#64748B"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickLine={false}
                  label={{ value: 'Mean Risk Score (Normalized %)', position: 'insideBottom', offset: -12, fill: '#64748B', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="avgImpact"
                  name="Impact Score"
                  domain={[0, 10]}
                  stroke="#64748B"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickLine={false}
                  label={{ value: 'Estimated Impact (1-10)', angle: -90, position: 'insideLeft', offset: 12, fill: '#64748B', fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="incidentCount" range={[120, 600]} name="Incident Count" />
                
                {/* Quadrant Partition Lines */}
                <ReferenceLine x={50} stroke="#2A3F66" strokeDasharray="4 4" />
                <ReferenceLine y={5} stroke="#2A3F66" strokeDasharray="4 4" />

                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#38BDF8' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as ThreatScatterPoint;
                      return (
                        <div className="bg-[#0D1525] border border-[#1E2D4A] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[210px]">
                          <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-1">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                              {d.threat}
                            </span>
                            <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                              {d.incidentCount} events
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-mono">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Avg Risk</span>
                              <span className="font-bold text-white">{d.avgRisk}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Avg Impact</span>
                              <span className="font-bold text-amber-300">{d.avgImpact} / 10</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Response SLA</span>
                              <span className="font-bold text-slate-200">{d.avgResponseTime} min</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Confirmed Flag</span>
                              <span className="font-bold text-emerald-400">{d.confirmedPct}%</span>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-[#1E2D4A] text-[10px] text-slate-400">
                            Primary Vector: <span className="text-cyan-300 font-medium">{d.topAttackVector}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Scatter
                  data={data}
                  onClick={(entry) => onSelectThreat && onSelectThreat(entry.threat)}
                  className="cursor-pointer transition-all"
                >
                  {data.map((entry) => {
                    const isSelected = selectedThreat === entry.threat;
                    return (
                      <Cell
                        key={`scatter-${entry.threat}`}
                        fill={entry.color}
                        stroke={isSelected ? '#FFFFFF' : '#111C2F'}
                        strokeWidth={isSelected ? 3 : 1}
                        fillOpacity={isSelected || !selectedThreat ? 0.9 : 0.4}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};
