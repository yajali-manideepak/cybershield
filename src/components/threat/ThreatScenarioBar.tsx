import React from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Radio, 
  Moon, 
  RotateCcw,
  Zap,
  Lock
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const ThreatScenarioBar: React.FC = () => {
  const { filters, setFilters, resetFilters, showToast } = useDashboard();

  const handleScenario = (
    name: string, 
    updater: () => void
  ) => {
    updater();
    showToast(`Loaded Hackathon Scenario: ${name}`, 'info');
  };

  const isAll = 
    filters.threatTypes.length === 0 && 
    filters.severities.length === 0 && 
    !filters.searchQuery && 
    !filters.dateStart;

  const isRansomwareMalware = 
    filters.threatTypes.includes('Ransomware') && 
    filters.threatTypes.includes('Malware') && 
    filters.threatTypes.length === 2;

  const isExfilInsider = 
    filters.threatTypes.includes('Data Exfiltration') && 
    filters.threatTypes.includes('Insider Threat') && 
    filters.threatTypes.length === 2;

  const isDDoSWeb = 
    filters.threatTypes.includes('DDoS') && 
    filters.threatTypes.includes('Web Attack') && 
    filters.threatTypes.length === 2;

  const isCriticalOnly = 
    filters.severities.length === 1 && 
    filters.severities.includes('Critical');

  return (
    <div className="bg-gradient-to-r from-[#111C2F] via-[#14233D] to-[#111C2F] border border-cyan-500/30 rounded-xl p-3.5 shadow-cyber-card relative overflow-hidden">
      {/* Glow line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 opacity-80" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                HACKATHON QUICK-DEMO SCENARIOS
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 font-semibold">
                1-CLICK DRILLDOWN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Preset analytical investigations designed for rapid judging presentations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset 1: All */}
          <button
            onClick={() => handleScenario('Full Ingested Telemetry', () => resetFilters())}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isAll
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                : 'bg-[#0D1525] border-[#1E2D4A] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>All Telemetry</span>
          </button>

          {/* Preset 2: Ransomware & Malware Outbreak */}
          <button
            onClick={() => handleScenario('Ransomware & Malware Outbreak', () => {
              setFilters(prev => ({
                ...prev,
                threatTypes: ['Ransomware', 'Malware'],
                severities: [],
              }));
            })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isRansomwareMalware
                ? 'bg-rose-500/20 text-rose-300 border-rose-400 shadow-sm'
                : 'bg-[#0D1525] border-[#1E2D4A] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Ransomware & Malware</span>
          </button>

          {/* Preset 3: Data Exfil & Insider Threat */}
          <button
            onClick={() => handleScenario('Data Exfiltration & Insider Threat', () => {
              setFilters(prev => ({
                ...prev,
                threatTypes: ['Data Exfiltration', 'Insider Threat'],
                severities: [],
              }));
            })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isExfilInsider
                ? 'bg-pink-500/20 text-pink-300 border-pink-400 shadow-sm'
                : 'bg-[#0D1525] border-[#1E2D4A] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-pink-400" />
            <span>Exfil & Insider Threat</span>
          </button>

          {/* Preset 4: DDoS & Web Assault */}
          <button
            onClick={() => handleScenario('DDoS & Web Assault', () => {
              setFilters(prev => ({
                ...prev,
                threatTypes: ['DDoS', 'Web Attack'],
                severities: [],
              }));
            })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isDDoSWeb
                ? 'bg-blue-500/20 text-blue-300 border-blue-400 shadow-sm'
                : 'bg-[#0D1525] border-[#1E2D4A] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>DDoS & Web Attack</span>
          </button>

          {/* Preset 5: Critical Severity Only */}
          <button
            onClick={() => handleScenario('Critical Severity Triage', () => {
              setFilters(prev => ({
                ...prev,
                severities: ['Critical'],
                threatTypes: [],
              }));
            })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isCriticalOnly
                ? 'bg-red-500/25 text-red-300 border-red-400 shadow-sm ring-1 ring-red-400/40'
                : 'bg-[#0D1525] border-[#1E2D4A] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Critical Only</span>
          </button>
        </div>
      </div>
    </div>
  );
};
