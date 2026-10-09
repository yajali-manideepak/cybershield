import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  Building, 
  Layers, 
  AlertTriangle, 
  Users, 
  HardDrive, 
  Clock, 
  Eye, 
  CheckCircle2,
  Crosshair
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { ThreatDossier, getThreatColor } from '../../utils/threatAnalytics';

interface ThreatDossierInspectorProps {
  dossier: ThreatDossier;
  threatTypes: string[];
  selectedThreat: string;
  onSelectThreat: (threat: string) => void;
  onInspectIncident: (incident: Incident) => void;
}

export const ThreatDossierInspector: React.FC<ThreatDossierInspectorProps> = ({
  dossier,
  threatTypes,
  selectedThreat,
  onSelectThreat,
  onInspectIncident,
}) => {
  const accentColor = selectedThreat === 'All' ? '#38BDF8' : getThreatColor(selectedThreat);

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-5 shadow-cyber-card space-y-5">
      {/* Header & Category Selector Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: `${accentColor}1A`, borderColor: `${accentColor}40` }}
            >
              <Crosshair className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                THREAT PROFILE DOSSIER & TARGET SURFACE
              </h3>
              <p className="text-[11px] text-slate-400">
                Detailed telemetry breakdown for {selectedThreat === 'All' ? 'All Threats' : selectedThreat}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 mr-1">Select Profile:</span>
          </div>
        </div>

        {/* Threat Type Selector Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectThreat('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              selectedThreat === 'All'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                : 'bg-[#0D1525] border-[#1E2D4A] text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>

          {threatTypes.map((t) => {
            const isSelected = selectedThreat === t;
            const color = getThreatColor(t);
            return (
              <button
                key={t}
                onClick={() => onSelectThreat(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-white text-white font-bold shadow-md'
                    : 'bg-[#0D1525] border-[#1E2D4A] text-slate-300 hover:text-white hover:border-slate-600'
                }`}
                style={isSelected ? { backgroundColor: `${color}33`, borderColor: color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                <span>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Incidents</span>
          <div className="text-xl font-bold font-mono text-white">
            {dossier.count.toLocaleString()}
          </div>
          <span className="text-[10px] text-cyan-400 font-medium">{dossier.pct}% of active scope</span>
        </div>

        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Mean Risk Index</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {(dossier.avgRiskScore * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] text-slate-400">{dossier.criticalCount} Critical cases</span>
        </div>

        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Mean Impact Score</span>
          <div className="text-xl font-bold font-mono text-amber-300">
            {dossier.avgImpactScore} <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[10px] text-slate-400">Simulated damage scale</span>
        </div>

        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Containment Time</span>
          <div className="text-xl font-bold font-mono text-white">
            {dossier.avgResponseMinutes} <span className="text-xs text-slate-500">min</span>
          </div>
          <span className="text-[10px] text-slate-400">Mean incident latency</span>
        </div>

        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Outbound Data MB</span>
          <div className="text-xl font-bold font-mono text-indigo-300">
            {dossier.totalOutboundMB.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Megabytes transferred</span>
        </div>

        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Impacted Users</span>
          <div className="text-xl font-bold font-mono text-white">
            {dossier.totalAffectedUsers.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Exposed accounts</span>
        </div>
      </div>

      {/* Target Surface Breakdown (Assets, Departments, Vectors) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Target Assets */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <Server className="w-3.5 h-3.5" />
            <span>Top Targeted Assets</span>
          </div>
          <div className="space-y-1.5">
            {dossier.topAssets.map((item, idx) => (
              <div key={item.asset} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate font-medium">
                  {idx + 1}. {item.asset}
                </span>
                <span className="font-mono text-cyan-300 font-bold ml-2">
                  {item.count} cases
                </span>
              </div>
            ))}
            {dossier.topAssets.length === 0 && (
              <span className="text-slate-500 text-xs">No asset data</span>
            )}
          </div>
        </div>

        {/* Top Impacted Departments */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
            <Building className="w-3.5 h-3.5" />
            <span>Top Impacted Departments</span>
          </div>
          <div className="space-y-1.5">
            {dossier.topDepartments.map((item, idx) => (
              <div key={item.department} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate font-medium">
                  {idx + 1}. {item.department}
                </span>
                <span className="font-mono text-purple-300 font-bold ml-2">
                  {item.count} cases
                </span>
              </div>
            ))}
            {dossier.topDepartments.length === 0 && (
              <span className="text-slate-500 text-xs">No department data</span>
            )}
          </div>
        </div>

        {/* Top Attack Vectors */}
        <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Primary Ingress Vectors</span>
          </div>
          <div className="space-y-1.5">
            {dossier.topVectors.map((item, idx) => (
              <div key={item.vector} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate font-medium">
                  {idx + 1}. {item.vector}
                </span>
                <span className="font-mono text-amber-300 font-bold ml-2">
                  {item.count} cases
                </span>
              </div>
            ))}
            {dossier.topVectors.length === 0 && (
              <span className="text-slate-500 text-xs">No vector data</span>
            )}
          </div>
        </div>
      </div>

      {/* Sample Incident Records for this Threat */}
      {dossier.sampleIncidents.length > 0 && (
        <div className="pt-2 border-t border-[#1E2D4A]/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Sample Simulated Incidents ({dossier.threat})
            </span>
            <span className="text-[10px] text-slate-400">Click row to inspect full 26-column telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {dossier.sampleIncidents.map((inc) => (
              <div
                key={inc.Incident_ID}
                onClick={() => onInspectIncident(inc)}
                className="bg-[#0D1525] border border-[#1E2D4A] hover:border-cyan-400/60 rounded-lg p-2.5 cursor-pointer transition-all hover:bg-[#16243C] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 group-hover:underline">
                    {inc.Incident_ID}
                  </span>
                  <span className={`text-[9px] font-semibold px-1 rounded ${
                    inc.Severity === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {inc.Severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 truncate font-medium">{inc.Affected_Asset}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{inc.Department} • {inc.Status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
