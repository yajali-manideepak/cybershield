import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { FilterPanel } from '../components/FilterPanel';
import { Incident, SeverityLevel, IncidentStatus } from '../types/incident';
import { exportIncidentsToCSV } from '../utils/exporter';

type SortField = keyof Incident;

export const IncidentExplorerPage: React.FC = () => {
  const { filteredIncidents, setSelectedIncident, showToast } = useDashboard();

  const [sortField, setSortField] = useState<SortField>('Date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localSearch, setLocalSearch] = useState<string>('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter with local search if present
  const searchedIncidents = useMemo(() => {
    if (!localSearch.trim()) return filteredIncidents;
    const q = localSearch.toLowerCase().trim();
    return filteredIncidents.filter((inc) => (
      inc.Incident_ID.toLowerCase().includes(q) ||
      inc.Threat_Type.toLowerCase().includes(q) ||
      inc.Affected_Asset.toLowerCase().includes(q) ||
      inc.Department.toLowerCase().includes(q) ||
      inc.Attack_Vector.toLowerCase().includes(q) ||
      inc.MITRE_Tactic.toLowerCase().includes(q) ||
      inc.Source_Country.toLowerCase().includes(q) ||
      inc.Status.toLowerCase().includes(q) ||
      inc.Analyst_ID.toLowerCase().includes(q)
    ));
  }, [filteredIncidents, localSearch]);

  // Sort
  const sortedIncidents = useMemo(() => {
    const list = [...searchedIncidents];
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = aVal.toString().toLowerCase();
      const strB = bVal.toString().toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    return list;
  }, [searchedIncidents, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedIncidents.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedIncidents.slice(start, start + pageSize);
  }, [sortedIncidents, currentPage, pageSize]);

  const handleExportCSV = () => {
    try {
      exportIncidentsToCSV(sortedIncidents, 'cybershield_explorer_records');
      showToast(`Exported ${sortedIncidents.length} records to CSV`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Export failed', 'error');
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Low':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Blocked':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Contained':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Resolved':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'Investigating':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Escalated':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'False Positive':
        return 'bg-slate-700/50 text-slate-400 border-slate-600';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  return (
    <div className="space-y-6">
      <FilterPanel />

      {/* Explorer Controls Bar */}
      <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              SECURITY INCIDENT TELEMETRY TABLE
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing {sortedIncidents.length.toLocaleString()} matching records (Page {currentPage} of {totalPages})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box inside table */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in table..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 w-48 sm:w-64"
            />
          </div>

          {/* Rows per page dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl shadow-cyber-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0D1525] text-slate-400 font-mono text-[11px] uppercase border-b border-[#1E2D4A] select-none sticky top-0">
              <tr>
                <th
                  onClick={() => handleSort('Incident_ID')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Incident ID</span>
                    {renderSortIcon('Incident_ID')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Date')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {renderSortIcon('Date')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Threat_Type')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Threat Type</span>
                    {renderSortIcon('Threat_Type')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Severity')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Severity</span>
                    {renderSortIcon('Severity')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Risk_Score')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Risk</span>
                    {renderSortIcon('Risk_Score')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Source_System')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>System</span>
                    {renderSortIcon('Source_System')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Affected_Asset')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Asset</span>
                    {renderSortIcon('Affected_Asset')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Department')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Dept</span>
                    {renderSortIcon('Department')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('MITRE_Tactic')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>MITRE Tactic</span>
                    {renderSortIcon('MITRE_Tactic')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Status')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {renderSortIcon('Status')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Response_Time_Minutes')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Resp Time</span>
                    {renderSortIcon('Response_Time_Minutes')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Is_Confirmed_Threat')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Confirmed</span>
                    {renderSortIcon('Is_Confirmed_Threat')}
                  </div>
                </th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/50">
              {paginatedRows.map((row) => (
                <tr
                  key={row.Incident_ID}
                  onClick={() => setSelectedIncident(row)}
                  className="hover:bg-[#16243C] transition-colors cursor-pointer group"
                >
                  <td className="p-3 font-mono font-bold text-cyan-400 group-hover:underline">
                    {row.Incident_ID}
                  </td>
                  <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                    {row.Date}
                  </td>
                  <td className="p-3 font-medium text-slate-100 whitespace-nowrap">
                    {row.Threat_Type}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(row.Severity)}`}>
                      {row.Severity}
                    </span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={`font-semibold ${row.Risk_Score > 0.7 ? 'text-rose-400' : row.Risk_Score > 0.4 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {row.Risk_Score.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 whitespace-nowrap">
                    {row.Source_System}
                  </td>
                  <td className="p-3 text-slate-300 whitespace-nowrap">
                    {row.Affected_Asset}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {row.Department}
                  </td>
                  <td className="p-3 text-indigo-300 whitespace-nowrap">
                    {row.MITRE_Tactic}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(row.Status)}`}>
                      {row.Status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {row.Response_Time_Minutes}m
                  </td>
                  <td className="p-3 text-center">
                    {row.Is_Confirmed_Threat ? (
                      <span title="Flagged True in dataset">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                      </span>
                    ) : (
                      <span title="Flagged False">
                        <XCircle className="w-4 h-4 text-slate-500 inline" />
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(row);
                      }}
                      className="p-1 rounded hover:bg-[#1E2D4A] text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Inspect full telemetry"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-500">
                    No incidents matched your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-[#0D1525] border-t border-[#1E2D4A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Showing <span className="font-semibold text-slate-200">{Math.min(sortedIncidents.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(sortedIncidents.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-cyan-300">{sortedIncidents.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#1E2D4A] text-slate-400 hover:text-white hover:bg-[#111C2F] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-slate-300 font-mono px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#1E2D4A] text-slate-400 hover:text-white hover:bg-[#111C2F] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
