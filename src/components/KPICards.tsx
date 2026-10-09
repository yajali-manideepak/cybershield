import React from 'react';
import { 
  AlertOctagon, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Activity, 
  Gauge, 
  Info
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const KPICards: React.FC = () => {
  const { kpis, filteredIncidents, incidents } = useDashboard();

  const totalLoaded = incidents.length;
  const filteredPct = totalLoaded > 0 ? Math.round((kpis.totalIncidents / totalLoaded) * 100) : 0;
  const critPct = kpis.totalIncidents > 0 ? Math.round((kpis.criticalIncidents / kpis.totalIncidents) * 100) : 0;
  const highRiskPct = kpis.totalIncidents > 0 ? Math.round((kpis.highRiskIncidents / kpis.totalIncidents) * 100) : 0;
  const confirmedPct = kpis.totalIncidents > 0 ? Math.round((kpis.confirmedThreats / kpis.totalIncidents) * 100) : 0;

  const cards = [
    {
      id: 'total',
      title: 'TOTAL INCIDENTS',
      value: kpis.totalIncidents.toLocaleString(),
      subtext: `${filteredPct}% of total ingested records`,
      icon: Activity,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      tooltip: 'Total active incident records matching current filter criteria.',
    },
    {
      id: 'critical',
      title: 'CRITICAL INCIDENTS',
      value: kpis.criticalIncidents.toLocaleString(),
      subtext: `${critPct}% of current filtered incidents`,
      icon: AlertOctagon,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      tooltip: 'Simulated events tagged with Severity == Critical needing priority response.',
    },
    {
      id: 'confirmed',
      title: 'CONFIRMED THREATS',
      value: kpis.confirmedThreats.toLocaleString(),
      subtext: `${confirmedPct}% flagged (synthetic data flag)`,
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      tooltip: 'Is_Confirmed_Threat == True. Note: Synthetic demonstration flag, not verified live threat intelligence.',
    },
    {
      id: 'response-time',
      title: 'AVG RESPONSE TIME',
      value: `${kpis.avgResponseTime} min`,
      subtext: kpis.medianResponseTime ? `Median: ${kpis.medianResponseTime} min` : 'Minutes to first action',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      tooltip: 'Mean Response_Time_Minutes from initial telemetry detection to status transition.',
    },
    {
      id: 'high-risk',
      title: 'HIGH-RISK INCIDENTS',
      value: kpis.highRiskIncidents.toLocaleString(),
      subtext: `${highRiskPct}% High or Critical combined`,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      tooltip: 'Cumulative incident count for High + Critical severity tiers.',
    },
    {
      id: 'risk-score',
      title: 'AVG RISK SCORE',
      value: kpis.avgRiskScore.toFixed(2),
      subtext: 'Normalized Scale: 0.00 – 1.00',
      icon: Gauge,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      tooltip: 'Simulated risk index calculated across all active filtered records.',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-[#111C2F] rounded-xl p-3.5 border ${card.borderColor} shadow-cyber-card hover:bg-[#16243C] transition-all relative group flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase truncate">
                  {card.title}
                </span>
                <div 
                  className={`w-6 h-6 rounded-md ${card.bgColor} flex items-center justify-center shrink-0`}
                  title={card.tooltip}
                >
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>

              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white mb-1">
                {card.value}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <span className="truncate">{card.subtext}</span>
            </div>

            {/* Hover Tooltip Helper */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap hidden sm:block">
              {card.tooltip}
            </div>
          </div>
        );
      })}
    </div>
  );
};
