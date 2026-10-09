import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Info,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const AutomaticInsightsPanel: React.FC = () => {
  const { insights, filteredIncidents } = useDashboard();

  if (filteredIncidents.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#1E2D4A]/60 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              AUTOMATED DESCRIPTIVE OBSERVATIONS
            </h3>
            <p className="text-[11px] text-slate-400">
              Algorithmic heuristics derived from current filtered dataset ({filteredIncidents.length} records)
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#0D1525] border border-[#1E2D4A] text-[10px] text-slate-400 font-mono">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Descriptive only • No causal inference</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Insight 1: Most Common Threat */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Predominant Threat Vector</span>
          </div>
          <div className="text-sm font-bold text-white mb-0.5">
            {insights.mostCommonThreat.name}
          </div>
          <p className="text-[11px] text-slate-400">
            Accounts for <span className="text-cyan-300 font-semibold">{insights.mostCommonThreat.count}</span> events ({insights.mostCommonThreat.pct}% of active filtered records).
          </p>
        </div>

        {/* Insight 2: Severity Skew */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Severity Distribution Peak</span>
          </div>
          <div className="text-sm font-bold text-white mb-0.5">
            {insights.mostFrequentSeverity.name} Severity
          </div>
          <p className="text-[11px] text-slate-400">
            Highest concentration at <span className="text-rose-300 font-semibold">{insights.mostFrequentSeverity.count}</span> incidents ({insights.mostFrequentSeverity.pct}%). Combined High + Critical total: <span className="text-orange-400 font-semibold">{insights.highAndCriticalCount}</span> ({insights.highAndCriticalPct}%).
          </p>
        </div>

        {/* Insight 3: Response Latency Hotspot */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Response Latency Hotspot</span>
          </div>
          {insights.highestResponseThreat ? (
            <>
              <div className="text-sm font-bold text-white mb-0.5">
                {insights.highestResponseThreat.name}
              </div>
              <p className="text-[11px] text-slate-400">
                Highest mean response time at <span className="text-amber-300 font-semibold">{insights.highestResponseThreat.avgTime} min</span> across {insights.highestResponseThreat.count} incidents.
              </p>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-slate-400 mb-0.5">Insufficient Sample</div>
              <p className="text-[11px] text-slate-500">
                Sample size is too small (&lt; 3 records per category) to compute reliable latency trends.
              </p>
            </>
          )}
        </div>

        {/* Insight 4: Threat Intel Enrichment Coverage */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Threat Intelligence Match Rate</span>
          </div>
          <div className="text-sm font-bold text-white mb-0.5">
            {insights.threatIntelCoveragePct}% Coverage
          </div>
          <p className="text-[11px] text-slate-400">
            <span className="text-indigo-300 font-semibold">{insights.threatIntelMatchCount}</span> of {filteredIncidents.length} events correlate with simulated external indicators (e.g. Known IP, Botnet, Advisory).
          </p>
        </div>

        {/* Insight 5: Geographic Source Concentration */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Top Geographic Source</span>
          </div>
          <div className="text-sm font-bold text-white mb-0.5">
            {insights.topRegion.name}
          </div>
          <p className="text-[11px] text-slate-400">
            Highest logged origin with <span className="text-emerald-300 font-semibold">{insights.topRegion.count}</span> incidents ({insights.topRegion.pct}% of active subset).
          </p>
        </div>

        {/* Insight 6: Department Impact */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Most Impacted Department</span>
          </div>
          <div className="text-sm font-bold text-white mb-0.5">
            {insights.topDepartment.name}
          </div>
          <p className="text-[11px] text-slate-400">
            Logged <span className="text-purple-300 font-semibold">{insights.topDepartment.count}</span> incident investigations in the selected timeframe.
          </p>
        </div>
      </div>
    </div>
  );
};
