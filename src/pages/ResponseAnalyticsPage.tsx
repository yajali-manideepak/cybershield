import React, { useMemo, useState } from 'react';
import { 
  Clock, 
  ActivitySquare, 
  AlertOctagon, 
  CheckCircle2, 
  Timer, 
  AlertTriangle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { FilterPanel } from '../components/FilterPanel';
import { Incident } from '../types/incident';
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

export const ResponseAnalyticsPage: React.FC = () => {
  const { filteredIncidents, kpis, setSelectedIncident } = useDashboard();
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Response time by threat type
  const threatRespData = useMemo(() => {
    const map: Record<string, { totalTime: number; count: number }> = {};
    filteredIncidents.forEach((inc) => {
      if (!map[inc.Threat_Type]) {
        map[inc.Threat_Type] = { totalTime: 0, count: 0 };
      }
      map[inc.Threat_Type].totalTime += inc.Response_Time_Minutes;
      map[inc.Threat_Type].count += 1;
    });

    return Object.entries(map)
      .map(([threat, data]) => ({
        threat,
        avgMinutes: Math.round((data.totalTime / data.count) * 10) / 10,
        count: data.count,
      }))
      .sort((a, b) => b.avgMinutes - a.avgMinutes);
  }, [filteredIncidents]);

  // High severity incidents by status
  const highSevByStatusData = useMemo(() => {
    const map: Record<string, number> = {
      Blocked: 0,
      Contained: 0,
      Investigating: 0,
      Resolved: 0,
      'False Positive': 0,
      Escalated: 0,
    };

    filteredIncidents.forEach((inc) => {
      if (inc.Severity === 'High' || inc.Severity === 'Critical') {
        map[inc.Status] = (map[inc.Status] || 0) + 1;
      }
    });

    return Object.entries(map).map(([status, count]) => ({
      status,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [filteredIncidents]);

  // Longest-response incidents list
  const longestResponseIncidents = useMemo(() => {
    const list = [...filteredIncidents];
    list.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.Response_Time_Minutes - a.Response_Time_Minutes
        : a.Response_Time_Minutes - b.Response_Time_Minutes;
    });
    return list.slice(0, 15);
  }, [filteredIncidents, sortOrder]);

  // Incidents that may need immediate investigation (e.g. Critical/High severity and status is Investigating or Escalated)
  const needsInvestigationIncidents = useMemo(() => {
    return filteredIncidents.filter(
      (inc) =>
        (inc.Severity === 'Critical' || inc.Severity === 'High') &&
        (inc.Status === 'Investigating' || inc.Status === 'Escalated')
    );
  }, [filteredIncidents]);

  return (
    <div className="space-y-6">
      {/* Descriptive Notice */}
      <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong>Descriptive Analysis Disclaimer:</strong> Response metrics and durations below reflect synthetic simulation timings. They represent descriptive analysis rather than confirmed root causes or real human analyst response efficacy.
        </div>
      </div>

      <FilterPanel />

      {/* SLA & Response Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">MEAN RESPONSE TIME</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.avgResponseTime} <span className="text-xs text-slate-400">minutes</span>
          </div>
          <div className="text-xs text-cyan-400">
            Average across {filteredIncidents.length} active incidents
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">MEDIAN RESPONSE TIME</span>
            <Timer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.medianResponseTime ?? 'N/A'} <span className="text-xs text-slate-400">minutes</span>
          </div>
          <div className="text-xs text-slate-400">
            50th percentile robust containment SLA
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">ACTIVE CRITICAL / HIGH</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mb-1">
            {needsInvestigationIncidents.length}
          </div>
          <div className="text-xs text-rose-300">
            High-severity cases in Investigating/Escalated state
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">CONTAINED & RESOLVED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
            {filteredIncidents.filter((i) => i.Status === 'Contained' || i.Status === 'Resolved').length}
          </div>
          <div className="text-xs text-slate-400">
            Incidents successfully stabilized
          </div>
        </div>
      </div>

      {/* Response Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time by Threat Type */}
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card h-[340px] flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
            MEAN RESPONSE TIME BY THREAT CATEGORY
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">
            Average time in minutes sorted by response duration
          </p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={threatRespData} margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2D4A" />
                <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} unit="m" tickLine={false} />
                <YAxis type="category" dataKey="threat" stroke="#64748B" tick={{ fontSize: 10, fill: '#CBD5E1' }} tickLine={false} width={120} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                          <div className="font-semibold text-white mb-1">{d.threat}</div>
                          <div className="text-amber-400 font-mono">Avg Time: {d.avgMinutes} min</div>
                          <div className="text-slate-400 font-mono text-[10px]">Incidents: {d.count}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgMinutes" fill="#F59E0B" radius={[0, 4, 4, 0]}>
                  {threatRespData.map((_, i) => (
                    <Cell key={`threat-time-${i}`} fill={i === 0 ? '#EF4444' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Severity Incidents by Status */}
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card h-[340px] flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
            HIGH & CRITICAL INCIDENTS BY STATUS
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">
            Lifecycle state distribution for high-priority incidents only
          </p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={highSevByStatusData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
                <XAxis dataKey="status" stroke="#64748B" tick={{ fontSize: 9, fill: '#94A3B8' }} angle={-20} textAnchor="end" interval={0} tickLine={false} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0D1525] border border-[#1E2D4A] p-2 rounded-lg text-xs">
                          <div className="font-semibold text-white">{d.status}</div>
                          <div className="text-rose-400 font-mono">Count: {d.count} High/Critical cases</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]}>
                  {highSevByStatusData.map((entry) => (
                    <Cell
                      key={`sev-status-${entry.status}`}
                      fill={entry.status === 'Escalated' || entry.status === 'Investigating' ? '#EF4444' : '#22C55E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Action Queue: High-Severity Needing Investigation */}
      <div className="bg-[#111C2F] border border-rose-500/30 rounded-xl p-4 shadow-cyber-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              PRIORITY TRIAGE QUEUE: UNRESOLVED CRITICAL & HIGH EVENTS
            </h4>
            <p className="text-[11px] text-slate-400">
              {needsInvestigationIncidents.length} incidents currently in 'Investigating' or 'Escalated' status
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#1E2D4A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0D1525] text-slate-400 font-mono text-[11px] uppercase border-b border-[#1E2D4A]">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Threat</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Affected Asset</th>
                <th className="p-3">Department</th>
                <th className="p-3">Response Time</th>
                <th className="p-3">Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/50">
              {needsInvestigationIncidents.slice(0, 10).map((inc) => (
                <tr
                  key={inc.Incident_ID}
                  onClick={() => setSelectedIncident(inc)}
                  className="hover:bg-[#16243C] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-cyan-400">{inc.Incident_ID}</td>
                  <td className="p-3 text-slate-200">{inc.Threat_Type}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {inc.Severity}
                    </span>
                  </td>
                  <td className="p-3 text-amber-300">{inc.Status}</td>
                  <td className="p-3 text-slate-300">{inc.Affected_Asset}</td>
                  <td className="p-3 text-slate-400">{inc.Department}</td>
                  <td className="p-3 font-mono text-slate-300">{inc.Response_Time_Minutes} min</td>
                  <td className="p-3 font-mono text-slate-400">{inc.Analyst_ID}</td>
                </tr>
              ))}
              {needsInvestigationIncidents.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No open Critical or High incidents in current filtered view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Longest Response Incidents Table */}
      <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              LONGEST RESPONSE INCIDENTS
            </h4>
            <p className="text-[11px] text-slate-400">
              Top latency records sorted by Response_Time_Minutes
            </p>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-[#0D1525] border border-[#1E2D4A] rounded-lg hover:text-white"
          >
            <ArrowUpDown className="w-3 h-3 text-cyan-400" />
            <span>Sort: {sortOrder === 'desc' ? 'Longest First' : 'Shortest First'}</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#1E2D4A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0D1525] text-slate-400 font-mono text-[11px] uppercase border-b border-[#1E2D4A]">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Threat Type</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Response Time</th>
                <th className="p-3">Impact Score</th>
                <th className="p-3">Asset</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/50">
              {longestResponseIncidents.map((inc) => (
                <tr
                  key={inc.Incident_ID}
                  onClick={() => setSelectedIncident(inc)}
                  className="hover:bg-[#16243C] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-cyan-400">{inc.Incident_ID}</td>
                  <td className="p-3 text-slate-200">{inc.Threat_Type}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {inc.Severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{inc.Status}</td>
                  <td className="p-3 font-mono font-bold text-amber-400">{inc.Response_Time_Minutes} min</td>
                  <td className="p-3 font-mono text-slate-300">{inc.Estimated_Impact_Score_1_10} / 10</td>
                  <td className="p-3 text-slate-400">{inc.Affected_Asset}</td>
                  <td className="p-3 text-right">
                    <span className="text-cyan-400 hover:text-white underline text-xs">Inspect</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
