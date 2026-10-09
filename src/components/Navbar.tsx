import React, { useState } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Download, 
  Search, 
  FileText, 
  Database, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useDashboard, DashboardPage } from '../context/DashboardContext';
import { exportIncidentsToCSV, exportSummaryReportToCSV } from '../utils/exporter';

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const PAGE_TITLES: Record<DashboardPage, { title: string; subtitle: string }> = {
  'overview': { title: 'Security Operations Overview', subtitle: 'Real-time telemetry & simulated incident KPIs' },
  'threat-analysis': { title: 'Threat Analysis & Attack Dynamics', subtitle: 'Multi-vector correlation, kill-chain progression & blast radius' },
  'threat-intel': { title: 'Threat Intelligence Analysis', subtitle: 'Indicator correlation & intelligence confidence' },
  'explorer': { title: 'Incident Explorer', subtitle: 'Deep-dive incident investigation & tabular querying' },
  'response': { title: 'Incident Response Analytics', subtitle: 'SLA metrics, containment speed & analyst workload' },
  'data-mgmt': { title: 'Dataset & Ingestion Management', subtitle: 'CSV schema validation, data quality & upload' },
};

export const Navbar: React.FC<NavbarProps> = () => {
  const { 
    activePage, 
    incidents, 
    filteredIncidents, 
    kpis, 
    insights, 
    qualityReport, 
    filters, 
    updateFilter, 
    lastRefreshed, 
    refreshData, 
    isLoading,
    showToast
  } = useDashboard();

  const [exportOpen, setExportOpen] = useState(false);

  const handleExportIncidents = () => {
    try {
      exportIncidentsToCSV(filteredIncidents, `cybershield_${activePage}`);
      showToast(`Exported ${filteredIncidents.length} incidents to CSV`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Export failed', 'error');
    }
    setExportOpen(false);
  };

  const handleExportSummary = () => {
    try {
      exportSummaryReportToCSV(kpis, insights, filteredIncidents.length, incidents.length);
      showToast('Exported executive summary report to CSV', 'success');
    } catch (e: any) {
      showToast(e.message || 'Summary export failed', 'error');
    }
    setExportOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const pageInfo = PAGE_TITLES[activePage] || { title: 'CyberShield Dashboard', subtitle: 'SOC Analytics' };

  return (
    <header className="sticky top-0 z-30 bg-[#0D1525]/95 backdrop-blur-md border-b border-[#1E2D4A] transition-colors">
      {/* Simulation Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-indigo-950/80 to-blue-950/80 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-medium tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>DEMO ENVIRONMENT — Synthetic cybersecurity incident data. Not connected to live security systems.</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Simulated Engine v2.4
          </span>
          <span className="text-slate-600">|</span>
          <span>Target: SOC Level-2 Analyst</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Page Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#6366F1] flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  CYBERSHIELD
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  SOC OPS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal hidden sm:block">
                Threat Intelligence & Incident Response
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-7 w-px bg-[#1E2D4A] mx-1"></div>

          {/* Current Page Breadcrumb */}
          <div className="hidden lg:block">
            <h1 className="text-sm font-semibold text-white leading-tight">
              {pageInfo.title}
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Search by ID, Threat, Asset, MITRE tactic, Country..."
              className="w-full bg-[#111C2F] text-slate-100 text-xs rounded-lg pl-9 pr-8 py-2 border border-[#1E2D4A] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] focus:outline-none transition-all placeholder:text-slate-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Dataset Status, Refresh, Export, Print */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dataset Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111C2F] border border-[#1E2D4A] text-[11px]">
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-slate-300 font-medium">
              {filteredIncidents.length === incidents.length ? (
                <span>{incidents.length.toLocaleString()} Records</span>
              ) : (
                <span className="text-cyan-400 font-semibold">
                  {filteredIncidents.length.toLocaleString()} / {incidents.length.toLocaleString()} Filtered
                </span>
              )}
            </span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>

          {/* Last Refresh */}
          <span className="hidden 2xl:inline text-[11px] text-slate-400 font-mono">
            {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2F] hover:bg-[#16243C] active:bg-[#1E2D4A] text-slate-300 hover:text-white border border-[#1E2D4A] text-xs font-medium transition-colors disabled:opacity-50"
            title="Refresh current dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111C2F] hover:bg-[#16243C] text-slate-300 hover:text-white border border-[#1E2D4A] text-xs font-medium transition-colors"
            title="Print Dashboard Report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/10 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {exportOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setExportOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#111C2F] border border-[#1E2D4A] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-[#1E2D4A] text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Export Dataset
                  </div>
                  <button
                    onClick={handleExportIncidents}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E2D4A] hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <div className="font-medium">Export Incidents (CSV)</div>
                      <div className="text-[10px] text-slate-400">{filteredIncidents.length} current filtered rows</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportSummary}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E2D4A] hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div className="font-medium">Export Executive Summary</div>
                      <div className="text-[10px] text-slate-400">KPIs & Automated observations CSV</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
