import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  RotateCcw, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  Layers,
  MapPin,
  Building,
  HardDrive
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { SeverityLevel, IncidentStatus } from '../types/incident';

export const FilterPanel: React.FC = () => {
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    filterOptions, 
    filteredIncidents, 
    incidents 
  } = useDashboard();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Toggle helpers for multi-select arrays
  const toggleArrayItem = <T extends string>(list: T[], item: T): T[] => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  // Count active filters
  const activeCount = 
    (filters.searchQuery ? 1 : 0) +
    (filters.dateStart ? 1 : 0) +
    (filters.dateEnd ? 1 : 0) +
    filters.severities.length +
    filters.threatTypes.length +
    filters.statuses.length +
    filters.sourceRegions.length +
    filters.sourceSystems.length +
    filters.departments.length +
    filters.affectedAssets.length +
    (filters.confirmedThreatOnly !== undefined ? 1 : 0);

  const severityColors: Record<SeverityLevel, { bg: string; text: string; activeBorder: string }> = {
    Low: { bg: 'bg-sky-950/60 text-sky-300', text: 'text-sky-400', activeBorder: 'border-sky-400 ring-sky-400/30' },
    Medium: { bg: 'bg-amber-950/60 text-amber-300', text: 'text-amber-400', activeBorder: 'border-amber-400 ring-amber-400/30' },
    High: { bg: 'bg-orange-950/60 text-orange-300', text: 'text-orange-400', activeBorder: 'border-orange-400 ring-orange-400/30' },
    Critical: { bg: 'bg-rose-950/60 text-rose-300', text: 'text-rose-400', activeBorder: 'border-rose-400 ring-rose-400/30' },
  };

  return (
    <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl shadow-cyber-card overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#1E2D4A]/60 bg-[#0E1726]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-wide">
                SOC FILTER CONSOLE
              </span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Showing <span className="font-semibold text-cyan-300">{filteredIncidents.length.toLocaleString()}</span> of {incidents.length.toLocaleString()} incidents
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1E2D4A]/60 hover:bg-[#1E2D4A] rounded-lg transition-colors border border-slate-700/50"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1E2D4A] transition-colors"
            title={isExpanded ? 'Collapse Filters' : 'Expand Filters'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* Top Row: Date Range & Severity Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Date Range */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>Detection Date Window</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={filters.dateStart}
                    min={filterOptions.minDate}
                    max={filterOptions.maxDate}
                    onChange={(e) => updateFilter('dateStart', e.target.value)}
                    className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Min: {filterOptions.minDate}</span>
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.dateEnd}
                    min={filterOptions.minDate}
                    max={filterOptions.maxDate}
                    onChange={(e) => updateFilter('dateEnd', e.target.value)}
                    className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Max: {filterOptions.maxDate}</span>
                </div>
              </div>
            </div>

            {/* Severity Multi-select Chips */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>Severity Classification</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Low', 'Medium', 'High', 'Critical'] as SeverityLevel[]).map((sev) => {
                  const isSelected = filters.severities.includes(sev);
                  const style = severityColors[sev];
                  return (
                    <button
                      key={sev}
                      onClick={() => updateFilter('severities', toggleArrayItem(filters.severities, sev))}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                        isSelected 
                          ? `${style.bg} ${style.activeBorder} ring-2` 
                          : 'bg-[#0D1525] border-[#1E2D4A] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirmed Threat Filter */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Synthetic Threat Flag</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => updateFilter('confirmedThreatOnly', undefined)}
                  className={`py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${
                    filters.confirmedThreatOnly === undefined
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-[#0D1525] border-[#1E2D4A] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => updateFilter('confirmedThreatOnly', true)}
                  className={`py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${
                    filters.confirmedThreatOnly === true
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                      : 'bg-[#0D1525] border-[#1E2D4A] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => updateFilter('confirmedThreatOnly', false)}
                  className={`py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${
                    filters.confirmedThreatOnly === false
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-[#0D1525] border-[#1E2D4A] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unconfirmed
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row: Dropdown Selectors for Threat Type, Status, Region, Department, Asset */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-[#1E2D4A]/60">
            {/* Threat Type */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Threat Type</label>
              <select
                value={filters.threatTypes[0] || ''}
                onChange={(e) => updateFilter('threatTypes', e.target.value ? [e.target.value] : [])}
                className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">All Threat Types</option>
                {filterOptions.threatTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Incident Status */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Incident Status</label>
              <select
                value={filters.statuses[0] || ''}
                onChange={(e) => updateFilter('statuses', e.target.value ? [e.target.value as IncidentStatus] : [])}
                className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Source Region */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Region
              </label>
              <select
                value={filters.sourceRegions[0] || ''}
                onChange={(e) => updateFilter('sourceRegions', e.target.value ? [e.target.value] : [])}
                className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">All Regions</option>
                {filterOptions.regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block flex items-center gap-1">
                <Building className="w-2.5 h-2.5" /> Department
              </label>
              <select
                value={filters.departments[0] || ''}
                onChange={(e) => updateFilter('departments', e.target.value ? [e.target.value] : [])}
                className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">All Departments</option>
                {filterOptions.departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Affected Asset */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-[11px] font-medium text-slate-400 mb-1 block flex items-center gap-1">
                <HardDrive className="w-2.5 h-2.5" /> Asset
              </label>
              <select
                value={filters.affectedAssets[0] || ''}
                onChange={(e) => updateFilter('affectedAssets', e.target.value ? [e.target.value] : [])}
                className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">All Assets</option>
                {filterOptions.assets.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeCount > 0 && (
            <div className="pt-2 border-t border-[#1E2D4A]/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 mr-1">Active filters:</span>
              
              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-[11px]">
                  Search: "{filters.searchQuery}"
                  <button onClick={() => updateFilter('searchQuery', '')}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}

              {filters.dateStart && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-[11px]">
                  From: {filters.dateStart}
                  <button onClick={() => updateFilter('dateStart', '')}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}

              {filters.dateEnd && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-[11px]">
                  To: {filters.dateEnd}
                  <button onClick={() => updateFilter('dateEnd', '')}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}

              {filters.severities.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  Sev: {s}
                  <button onClick={() => updateFilter('severities', filters.severities.filter(i => i !== s))}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              ))}

              {filters.threatTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  Threat: {t}
                  <button onClick={() => updateFilter('threatTypes', filters.threatTypes.filter(i => i !== t))}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              ))}

              {filters.statuses.map(st => (
                <span key={st} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  Status: {st}
                  <button onClick={() => updateFilter('statuses', filters.statuses.filter(i => i !== st))}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              ))}

              {filters.sourceRegions.map(r => (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  Region: {r}
                  <button onClick={() => updateFilter('sourceRegions', filters.sourceRegions.filter(i => i !== r))}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              ))}

              {filters.departments.map(d => (
                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  Dept: {d}
                  <button onClick={() => updateFilter('departments', filters.departments.filter(i => i !== d))}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              ))}

              {filters.affectedAssets.map(a => (
                <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  Asset: {a}
                  <button onClick={() => updateFilter('affectedAssets', filters.affectedAssets.filter(i => i !== a))}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              ))}

              {filters.confirmedThreatOnly !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px]">
                  {filters.confirmedThreatOnly ? 'Confirmed Only' : 'Unconfirmed Only'}
                  <button onClick={() => updateFilter('confirmedThreatOnly', undefined)}><X className="w-3 h-3 hover:text-white" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
