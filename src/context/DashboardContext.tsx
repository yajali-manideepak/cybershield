import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Incident, FilterState, KPIStats, AutomaticInsights, DataQualityReport } from '../types/incident';
import { parseCSVData } from '../utils/csvParser';
import { applyFilters, calculateKPIs, calculateInsights } from '../utils/analytics';

export type DashboardPage = 'overview' | 'threat-analysis' | 'threat-intel' | 'explorer' | 'response' | 'data-mgmt';

interface DashboardContextType {
  incidents: Incident[];
  filteredIncidents: Incident[];
  kpis: KPIStats;
  insights: AutomaticInsights;
  qualityReport: DataQualityReport | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  activePage: DashboardPage;
  setActivePage: (page: DashboardPage) => void;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  isLoading: boolean;
  loadError: string | null;
  lastRefreshed: Date;
  refreshData: () => Promise<void>;
  handleFileUpload: (file: File) => Promise<{ success: boolean; message: string }>;
  resetToOriginalDataset: () => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  filterOptions: {
    severities: string[];
    threatTypes: string[];
    statuses: string[];
    regions: string[];
    systems: string[];
    departments: string[];
    assets: string[];
    minDate: string;
    maxDate: string;
  };
}

const defaultFilters: FilterState = {
  searchQuery: '',
  dateStart: '',
  dateEnd: '',
  severities: [],
  threatTypes: [],
  statuses: [],
  sourceRegions: [],
  sourceSystems: [],
  departments: [],
  affectedAssets: [],
  confirmedThreatOnly: undefined,
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [originalCsvText, setOriginalCsvText] = useState<string>('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activePage, setActivePage] = useState<DashboardPage>('overview');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    showToast('Filters cleared to default view', 'info');
  };

  const processAndSetCSV = (csvText: string, fileName: string = 'cybersecurity_threat_intelligence_1000_rows.csv') => {
    const { incidents: parsed, report, error } = parseCSVData(csvText, fileName);
    if (error && parsed.length === 0) {
      setLoadError(error);
      return false;
    }

    setIncidents(parsed);
    setQualityReport(report);
    setLoadError(null);
    setLastRefreshed(new Date());
    return true;
  };

  // Initial load
  const loadInitialData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Look for public CSV
      const pathsToTry = [
        '/data/cybersecurity_threat_intelligence_1000_rows.csv',
        '/cybersecurity_threat_intelligence_1000_rows.csv'
      ];
      
      let fetchedText = '';
      for (const p of pathsToTry) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            fetchedText = await res.text();
            break;
          }
        } catch {
          // continue
        }
      }

      if (fetchedText) {
        setOriginalCsvText(fetchedText);
        processAndSetCSV(fetchedText, 'cybersecurity_threat_intelligence_1000_rows.csv');
      } else {
        setLoadError('Default dataset file not found in public paths. Please upload the CSV manually via Data Management.');
      }
    } catch (err: any) {
      setLoadError(`Failed to load dataset: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    if (originalCsvText) {
      processAndSetCSV(originalCsvText, qualityReport?.fileName || 'cybersecurity_threat_intelligence_1000_rows.csv');
      showToast('Dataset refreshed successfully', 'success');
    } else {
      await loadInitialData();
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (file: File): Promise<{ success: boolean; message: string }> => {
    if (!file.name.endsWith('.csv')) {
      return { success: false, message: 'Invalid file type. Please upload a .csv file.' };
    }

    try {
      const text = await file.text();
      const { incidents: parsed, report, error } = parseCSVData(text, file.name);

      if (error && parsed.length === 0) {
        return { success: false, message: error };
      }

      setIncidents(parsed);
      setQualityReport(report);
      setLoadError(null);
      setLastRefreshed(new Date());
      resetFilters();
      showToast(`Successfully imported ${parsed.length} rows from ${file.name}`, 'success');
      return {
        success: true,
        message: `Imported ${parsed.length} valid incident records (${report.rejectedRows} rejected).`,
      };
    } catch (err: any) {
      return { success: false, message: `Upload error: ${err.message}` };
    }
  };

  const resetToOriginalDataset = async () => {
    if (originalCsvText) {
      processAndSetCSV(originalCsvText, 'cybersecurity_threat_intelligence_1000_rows.csv');
      resetFilters();
      showToast('Reset to original synthetic dataset', 'success');
    } else {
      await loadInitialData();
    }
  };

  // Compute unique values for filter options
  const filterOptions = useMemo(() => {
    const threatTypes = new Set<string>();
    const severities = new Set<string>();
    const statuses = new Set<string>();
    const regions = new Set<string>();
    const systems = new Set<string>();
    const departments = new Set<string>();
    const assets = new Set<string>();
    let minDate = '';
    let maxDate = '';

    incidents.forEach(item => {
      if (item.Threat_Type) threatTypes.add(item.Threat_Type);
      if (item.Severity) severities.add(item.Severity);
      if (item.Status) statuses.add(item.Status);
      if (item.Source_Region) regions.add(item.Source_Region);
      if (item.Source_System) systems.add(item.Source_System);
      if (item.Department) departments.add(item.Department);
      if (item.Affected_Asset) assets.add(item.Affected_Asset);
      if (item.Date) {
        if (!minDate || item.Date < minDate) minDate = item.Date;
        if (!maxDate || item.Date > maxDate) maxDate = item.Date;
      }
    });

    return {
      threatTypes: Array.from(threatTypes).sort(),
      severities: ['Low', 'Medium', 'High', 'Critical'],
      statuses: ['Blocked', 'Contained', 'Investigating', 'Resolved', 'False Positive', 'Escalated'],
      regions: Array.from(regions).sort(),
      systems: Array.from(systems).sort(),
      departments: Array.from(departments).sort(),
      assets: Array.from(assets).sort(),
      minDate,
      maxDate,
    };
  }, [incidents]);

  // Derived filtered incidents
  const filteredIncidents = useMemo(() => {
    return applyFilters(incidents, filters);
  }, [incidents, filters]);

  // Derived dynamic KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(filteredIncidents);
  }, [filteredIncidents]);

  // Derived dynamic Insights
  const insights = useMemo(() => {
    return calculateInsights(filteredIncidents);
  }, [filteredIncidents]);

  return (
    <DashboardContext.Provider
      value={{
        incidents,
        filteredIncidents,
        kpis,
        insights,
        qualityReport,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activePage,
        setActivePage,
        selectedIncident,
        setSelectedIncident,
        isLoading,
        loadError,
        lastRefreshed,
        refreshData,
        handleFileUpload,
        resetToOriginalDataset,
        toast,
        showToast,
        filterOptions,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
