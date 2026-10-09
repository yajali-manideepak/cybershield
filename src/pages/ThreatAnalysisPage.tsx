import React, { useMemo, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { FilterPanel } from '../components/FilterPanel';
import { ThreatScenarioBar } from '../components/threat/ThreatScenarioBar';
import { KillChainProgressionChart } from '../components/threat/KillChainProgressionChart';
import { DiurnalHourlyChart } from '../components/threat/DiurnalHourlyChart';
import { AttackVectorBarChart } from '../components/threat/AttackVectorBarChart';
import { ThreatDossierInspector } from '../components/threat/ThreatDossierInspector';
import { 
  computeThreatScatterData, 
  computeAttackVectorBreakdown, 
  computeKillChainProgression, 
  computeHourlyAttackDensity, 
  computeThreatDossier 
} from '../utils/threatAnalytics';
import { 
  Crosshair, 
  AlertTriangle, 
  Flame, 
  Layers, 
  Clock, 
  Users, 
  HardDrive, 
  Info 
} from 'lucide-react';

export const ThreatAnalysisPage: React.FC = () => {
  const { filteredIncidents, setSelectedIncident, filterOptions } = useDashboard();
  const [selectedThreat, setSelectedThreat] = useState<string>('All');

  // Compute analytics
  const scatterData = useMemo(() => computeThreatScatterData(filteredIncidents), [filteredIncidents]);
  const vectorData = useMemo(() => computeAttackVectorBreakdown(filteredIncidents), [filteredIncidents]);
  const killChainData = useMemo(() => computeKillChainProgression(filteredIncidents), [filteredIncidents]);
  const hourlyData = useMemo(() => computeHourlyAttackDensity(filteredIncidents), [filteredIncidents]);
  const dossier = useMemo(() => computeThreatDossier(filteredIncidents, selectedThreat), [filteredIncidents, selectedThreat]);

  // Derived high-risk summary
  const highestRisk = useMemo(() => {
    if (scatterData.length === 0) return { threat: 'N/A', risk: 0 };
    const sorted = [...scatterData].sort((a, b) => b.avgRisk - a.avgRisk);
    return { threat: sorted[0].threat, risk: sorted[0].avgRisk };
  }, [scatterData]);

  const highestImpact = useMemo(() => {
    if (scatterData.length === 0) return { threat: 'N/A', impact: 0 };
    const sorted = [...scatterData].sort((a, b) => b.avgImpact - a.avgImpact);
    return { threat: sorted[0].threat, impact: sorted[0].avgImpact };
  }, [scatterData]);

  return (
    <div className="space-y-6">
      {/* Simulation Disclaimer Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-indigo-950/40 to-cyan-950/40 border border-cyan-500/20 rounded-xl p-3.5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-200 leading-relaxed">
          <strong className="text-cyan-300">Advanced Threat Analysis & Kill-Chain Dynamics.</strong> Simulated threat landscape telemetry detailing multi-vector ingress, temporal diurnal rhythms, MITRE ATT&CK progression, and blast radius indicators across {filteredIncidents.length} incident records.
        </div>
      </div>

      {/* Hackathon Preset Scenarios Bar */}
      <ThreatScenarioBar />

      {/* Global Filter Console */}
      <FilterPanel />

      {/* High-Level Threat Intelligence KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-3.5 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">ACTIVE THREAT TYPES</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-0.5">
            {scatterData.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {filteredIncidents.length} matching events
          </div>
        </div>

        <div className="bg-[#111C2F] border border-rose-500/30 rounded-xl p-3.5 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">HIGHEST RISK PROFILE</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-white truncate mb-0.5">
            {highestRisk.threat}
          </div>
          <div className="text-[11px] text-rose-300 font-mono">
            {highestRisk.risk}% mean risk score
          </div>
        </div>

        <div className="bg-[#111C2F] border border-amber-500/30 rounded-xl p-3.5 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">MAX IMPACT POTENTIAL</span>
            <Crosshair className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white truncate mb-0.5">
            {highestImpact.threat}
          </div>
          <div className="text-[11px] text-amber-300 font-mono">
            {highestImpact.impact} / 10 estimated impact
          </div>
        </div>

        <div className="bg-[#111C2F] border border-indigo-500/30 rounded-xl p-3.5 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">CUMULATIVE EXFILTRATION</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300 mb-0.5">
            {dossier.totalOutboundMB.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MB</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {dossier.totalAffectedUsers.toLocaleString()} impacted accounts
          </div>
        </div>
      </div>

      {/* Row 1: MITRE Kill-Chain Progression & 24-Hour Diurnal Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KillChainProgressionChart data={killChainData} />
        <DiurnalHourlyChart data={hourlyData} />
      </div>

      {/* Row 3: Ingress Attack Vectors Breakdown */}
      <AttackVectorBarChart data={vectorData} />

      {/* Row 4: Detailed Threat Profile Dossier & Target Surface */}
      <ThreatDossierInspector
        dossier={dossier}
        threatTypes={filterOptions.threatTypes}
        selectedThreat={selectedThreat}
        onSelectThreat={(t) => setSelectedThreat(t)}
        onInspectIncident={(inc) => setSelectedIncident(inc)}
      />
    </div>
  );
};
