import React, { useMemo, useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Filter, 
  Search, 
  AlertTriangle,
  ArrowUpDown,
  ExternalLink
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
  PieChart,
  Pie,
  Legend,
} from 'recharts';

export const ThreatIntelPage: React.FC = () => {
  const { filteredIncidents, setSelectedIncident } = useDashboard();
  const [tableSearch, setTableSearch] = useState('');
  const [selectedMatchFilter, setSelectedMatchFilter] = useState<string>('all');

  // Distribution of intelligence match types & confidence
  const { matchTypeData, withVsWithoutData, threatVsMatchData, matchingIncidents } = useMemo(() => {
    const matchCounts: Record<string, { count: number; totalConf: number }> = {};
    let withMatch = 0;
    let withoutMatch = 0;
    const threatMatchMap: Record<string, Record<string, number>> = {};

    filteredIncidents.forEach((inc) => {
      const match = inc.Threat_Intelligence_Match || 'No external match';
      const isNone = match.toLowerCase() === 'no external match';

      if (isNone) {
        withoutMatch++;
      } else {
        withMatch++;
      }

      if (!matchCounts[match]) {
        matchCounts[match] = { count: 0, totalConf: 0 };
      }
      matchCounts[match].count++;
      matchCounts[match].totalConf += inc.Intel_Confidence_Pct;

      // Cross table
      if (!threatMatchMap[inc.Threat_Type]) {
        threatMatchMap[inc.Threat_Type] = {};
      }
      threatMatchMap[inc.Threat_Type][match] = (threatMatchMap[inc.Threat_Type][match] || 0) + 1;
    });

    const matchTypeArr = Object.entries(matchCounts).map(([type, data]) => ({
      type,
      count: data.count,
      avgConfidence: Math.round((data.totalConf / data.count) * 10) / 10,
    })).sort((a, b) => b.count - a.count);

    const withVsWithout = [
      { name: 'External Match Correlated', value: withMatch, color: '#38BDF8' },
      { name: 'No External Match', value: withoutMatch, color: '#64748B' },
    ];

    const threatVsMatch = Object.entries(threatMatchMap).map(([threat, matches]) => ({
      threat,
      ...matches,
    })).slice(0, 8);

    const matchingList = filteredIncidents.filter(
      (inc) => inc.Threat_Intelligence_Match && inc.Threat_Intelligence_Match.toLowerCase() !== 'no external match'
    );

    return {
      matchTypeData: matchTypeArr,
      withVsWithoutData: withVsWithout,
      threatVsMatchData: threatVsMatch,
      matchingIncidents: matchingList,
    };
  }, [filteredIncidents]);

  // Filter matching table
  const displayedTableRecords = useMemo(() => {
    return matchingIncidents.filter((inc) => {
      if (selectedMatchFilter !== 'all' && inc.Threat_Intelligence_Match !== selectedMatchFilter) {
        return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        return (
          inc.Incident_ID.toLowerCase().includes(q) ||
          inc.Threat_Type.toLowerCase().includes(q) ||
          inc.Threat_Intelligence_Match.toLowerCase().includes(q) ||
          inc.Source_Country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [matchingIncidents, selectedMatchFilter, tableSearch]);

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3.5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <strong>Threat Intelligence Simulation Notice:</strong> The indicators and confidence ratings below (e.g. "Known malicious IP", "Botnet indicator", "Vulnerability advisory") are synthetic mock labels contained in the dataset for demonstration purposes. They are not derived from live external threat feeds (e.g. VirusTotal, AlienVault, or Mandiant).
        </div>
      </div>

      <FilterPanel />

      {/* Top Metric Cards for Threat Intel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">EXTERNAL MATCH COVERAGE</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {matchingIncidents.length.toLocaleString()} <span className="text-xs text-slate-400">/ {filteredIncidents.length}</span>
          </div>
          <div className="text-xs text-cyan-400 font-semibold">
            {filteredIncidents.length > 0
              ? `${Math.round((matchingIncidents.length / filteredIncidents.length) * 100)}% Correlated`
              : '0%'}
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">UNMATCHED EVENTS</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {(filteredIncidents.length - matchingIncidents.length).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Internal telemetry with zero external matches
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">MEAN INTEL CONFIDENCE</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {matchingIncidents.length > 0
              ? `${(
                  matchingIncidents.reduce((acc, curr) => acc + curr.Intel_Confidence_Pct, 0) /
                  matchingIncidents.length
                ).toFixed(1)}%`
              : '0%'}
          </div>
          <div className="text-xs text-indigo-300">
            Average indicator confidence level
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Type Distribution */}
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card h-[320px] flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
            DISTRIBUTION OF INTELLIGENCE MATCH TYPES
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">
            Frequency of simulated indicator classifications
          </p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={matchTypeData} margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2D4A" />
                <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} />
                <YAxis type="category" dataKey="type" stroke="#64748B" tick={{ fontSize: 10, fill: '#CBD5E1' }} tickLine={false} width={130} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0D1525] border border-[#1E2D4A] p-2.5 rounded-lg shadow-xl text-xs">
                          <div className="font-semibold text-white mb-1">{d.type}</div>
                          <div className="text-cyan-400 font-mono">Count: {d.count}</div>
                          <div className="text-indigo-400 font-mono">Avg Conf: {d.avgConfidence}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]}>
                  {matchTypeData.map((_, i) => (
                    <Cell key={`match-cell-${i}`} fill={i === 0 ? '#38BDF8' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Confidence by Match Type */}
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card h-[320px] flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
            AVERAGE INTEL CONFIDENCE BY MATCH TYPE
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">
            Simulated confidence rating (0% – 100%)
          </p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchTypeData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D4A" />
                <XAxis dataKey="type" stroke="#64748B" tick={{ fontSize: 9, fill: '#94A3B8' }} angle={-20} textAnchor="end" interval={0} tickLine={false} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} unit="%" domain={[0, 100]} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0D1525] border border-[#1E2D4A] p-2 rounded-lg text-xs">
                          <div className="font-semibold text-white">{d.type}</div>
                          <div className="text-indigo-400 font-mono">Avg Confidence: {d.avgConfidence}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgConfidence" fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table of Matching Incident Records */}
      <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CORRELATED INTEL INCIDENTS TABLE
            </h4>
            <p className="text-[11px] text-slate-400">
              Showing {displayedTableRecords.length} records with external intelligence attributes
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by Match Type */}
            <select
              value={selectedMatchFilter}
              onChange={(e) => setSelectedMatchFilter(e.target.value)}
              className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Match Types</option>
              {matchTypeData
                .filter((m) => m.type.toLowerCase() !== 'no external match')
                .map((m) => (
                  <option key={m.type} value={m.type}>
                    {m.type} ({m.count})
                  </option>
                ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Incident Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1E2D4A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0D1525] text-slate-400 font-mono text-[11px] uppercase border-b border-[#1E2D4A]">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Threat Type</th>
                <th className="p-3">Intel Match Type</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Source Country</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/50">
              {displayedTableRecords.slice(0, 15).map((row) => (
                <tr
                  key={row.Incident_ID}
                  className="hover:bg-[#16243C] transition-colors cursor-pointer group"
                  onClick={() => setSelectedIncident(row)}
                >
                  <td className="p-3 font-mono font-bold text-cyan-400 group-hover:underline">
                    {row.Incident_ID}
                  </td>
                  <td className="p-3 text-slate-200">{row.Threat_Type}</td>
                  <td className="p-3 text-indigo-300 font-medium">
                    {row.Threat_Intelligence_Match}
                  </td>
                  <td className="p-3 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {row.Intel_Confidence_Pct}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.Severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300'
                          : row.Severity === 'High'
                          ? 'bg-orange-500/20 text-orange-300'
                          : row.Severity === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {row.Severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{row.Status}</td>
                  <td className="p-3 text-slate-400">{row.Source_Country}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(row);
                      }}
                      className="text-cyan-400 hover:text-white text-xs underline font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {displayedTableRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No intelligence records match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
