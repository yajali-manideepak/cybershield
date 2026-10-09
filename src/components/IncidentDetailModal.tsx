import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Server, 
  Building, 
  User, 
  Layers, 
  FileText, 
  AlertCircle,
  Activity,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Incident, SeverityLevel, IncidentStatus } from '../types/incident';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, onClose }) => {
  if (!incident) return null;

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Low':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Blocked':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Contained':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Resolved':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Investigating':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Escalated':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'False Positive':
        return 'bg-slate-700/50 text-slate-400 border-slate-600';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-[#111C2F] border border-[#1E2D4A] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D1525] border-b border-[#1E2D4A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{incident.Incident_ID}</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getSeverityBadge(incident.Severity)}`}>
                  {incident.Severity}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(incident.Status)}`}>
                  {incident.Status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Threat Classification: <span className="text-slate-200 font-medium">{incident.Threat_Type}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2D4A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Simulated Risk Score</span>
              <div className="text-lg font-bold font-mono text-white">
                {(incident.Risk_Score * 100).toFixed(0)} <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-[#1E2D4A] h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${incident.Risk_Score > 0.7 ? 'bg-rose-500' : incident.Risk_Score > 0.4 ? 'bg-amber-500' : 'bg-cyan-500'}`} 
                  style={{ width: `${Math.min(100, incident.Risk_Score * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Response Duration</span>
              <div className="text-lg font-bold font-mono text-amber-300">
                {incident.Response_Time_Minutes} <span className="text-xs text-slate-500">min</span>
              </div>
              <span className="text-[10px] text-slate-400">To initial containment</span>
            </div>

            <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Impact Rating (1-10)</span>
              <div className="text-lg font-bold font-mono text-orange-300">
                {incident.Estimated_Impact_Score_1_10} <span className="text-xs text-slate-500">/ 10</span>
              </div>
              <span className="text-[10px] text-slate-400">{incident.Affected_Users} Users Exposed</span>
            </div>

            <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Threat Confirmation</span>
              <div className="flex items-center gap-1.5 mt-1">
                {incident.Is_Confirmed_Threat ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">Confirmed (Flagged)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">Unconfirmed</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-500">Synthetic attribute flag</span>
            </div>
          </div>

          {/* Technical Telemetry Grid */}
          <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Incident Telemetry & Attack Surface</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Detection Timestamp:
                </span>
                <span className="font-mono text-slate-200">{incident.Timestamp || incident.Date}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" /> Source Detection System:
                </span>
                <span className="text-slate-200 font-medium">{incident.Source_System}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Affected Asset Target:
                </span>
                <span className="text-slate-200 font-medium">{incident.Affected_Asset}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Department:
                </span>
                <span className="text-slate-200">{incident.Department}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Ingress Attack Vector:
                </span>
                <span className="text-slate-200">{incident.Attack_Vector}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Simulated Origin:
                </span>
                <span className="text-slate-200">{incident.Source_Country} ({incident.Source_Region})</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400">Outbound Data Volume:</span>
                <span className="font-mono text-slate-200">{incident.Outbound_Data_MB.toFixed(2)} MB</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#1E2D4A]/50 pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Triage Analyst Assigned:
                </span>
                <span className="font-mono text-cyan-300 font-medium">{incident.Analyst_ID}</span>
              </div>
            </div>
          </div>

          {/* MITRE & Threat Intelligence Enrichment */}
          <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Framework Alignment & Simulated Intelligence Match</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-lg p-3">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">MITRE ATT&CK Tactic</span>
                <div className="text-sm font-bold text-white mb-1">{incident.MITRE_Tactic}</div>
                <p className="text-[10px] text-slate-500">
                  Illustrative mapping in synthetic demonstration dataset.
                </p>
              </div>

              <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Threat Intel Match</span>
                  <span className="text-[10px] font-mono text-indigo-300 font-semibold">{incident.Intel_Confidence_Pct}% Conf</span>
                </div>
                <div className="text-sm font-bold text-indigo-300 mb-1">{incident.Threat_Intelligence_Match}</div>
                <div className="w-full bg-[#1E2D4A] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${incident.Intel_Confidence_Pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analyst Notes */}
          <div className="bg-[#0D1525] border border-[#1E2D4A] rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulated Analyst Investigation Notes</span>
            </h4>
            <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-lg p-3 text-slate-300 font-mono text-xs leading-relaxed">
              {incident.Notes || 'No additional notes provided for this record.'}
            </div>
          </div>

          {/* Section 9 Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Simulation Notice:</strong> This detail view presents synthetic demonstration fields only. No real packet payloads, live malware hashes, external IP attribution, or live server containment actions are performed.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0D1525] border-t border-[#1E2D4A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1E2D4A] hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
