import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FilterPanel } from '../components/FilterPanel';
import { KPICards } from '../components/KPICards';
import { AutomaticInsightsPanel } from '../components/AutomaticInsightsPanel';
import { ActivityTimeChart } from '../components/charts/ActivityTimeChart';
import { ThreatTypeChart } from '../components/charts/ThreatTypeChart';
import { SeverityDonutChart } from '../components/charts/SeverityDonutChart';
import { IncidentStatusChart } from '../components/charts/IncidentStatusChart';
import { MitreTacticChart } from '../components/charts/MitreTacticChart';
import { GeographicSourceChart } from '../components/charts/GeographicSourceChart';
import { ResponseTimeBySeverityChart } from '../components/charts/ResponseTimeBySeverityChart';
import { ThreatTypeVsSeverityChart } from '../components/charts/ThreatTypeVsSeverityChart';
import { AlertCircle, RotateCcw, Crosshair, ArrowRight } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { filteredIncidents, resetFilters, setActivePage } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Demo B Threat Analysis Quick Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-cyber-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Crosshair className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                FEATURED: THREAT ANALYSIS & ATTACK DYNAMICS
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30 font-semibold">
                ANALYTICS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Explore MITRE Kill-Chain Progression, Ingress Pathways, and 24h Diurnal Rhythms.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('threat-analysis')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-semibold shrink-0 transition-all shadow-sm group"
        >
          <span>Open Threat Analysis</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Global Filter Bar */}
      <FilterPanel />

      {/* Dynamic KPI Cards */}
      <KPICards />

      {/* Automated Descriptive Insights */}
      <AutomaticInsightsPanel />

      {/* Charts Grid */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-12 text-center shadow-cyber-card">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white mb-1">No Matching Incident Telemetry</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            The active filter combination yielded zero records. Adjust or reset your filter criteria to display incident analytics.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Activity Time & Threat Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityTimeChart incidents={filteredIncidents} />
            <ThreatTypeChart incidents={filteredIncidents} />
          </div>

          {/* Row 2: Severity Donut & Status Lifecycle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeverityDonutChart incidents={filteredIncidents} />
            <IncidentStatusChart incidents={filteredIncidents} />
          </div>

          {/* Row 3: MITRE ATT&CK & Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MitreTacticChart incidents={filteredIncidents} />
            <GeographicSourceChart incidents={filteredIncidents} />
          </div>

          {/* Row 4: Response Time by Severity & Threat Type vs Severity Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponseTimeBySeverityChart incidents={filteredIncidents} />
            <ThreatTypeVsSeverityChart incidents={filteredIncidents} />
          </div>
        </div>
      )}
    </div>
  );
};
