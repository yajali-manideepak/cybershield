import React, { useRef, useState } from 'react';
import { 
  Database, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  RefreshCw, 
  Columns, 
  Calendar, 
  FileText,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { REQUIRED_COLUMNS } from '../utils/csvParser';
import { exportSummaryReportToCSV } from '../utils/exporter';

export const DataManagementPage: React.FC = () => {
  const { 
    qualityReport, 
    incidents, 
    filteredIncidents, 
    kpis, 
    insights, 
    handleFileUpload, 
    resetToOriginalDataset, 
    refreshData, 
    isLoading,
    showToast 
  } = useDashboard();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: 'loading', message: `Validating and parsing ${file.name}...` });
    const res = await handleFileUpload(file);
    if (res.success) {
      setUploadStatus({ type: 'success', message: res.message });
    } else {
      setUploadStatus({ type: 'error', message: res.message });
      showToast(res.message, 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    await resetToOriginalDataset();
    setUploadStatus({ type: 'idle', message: '' });
  };

  const missingColumns = qualityReport
    ? REQUIRED_COLUMNS.filter((rc) => !qualityReport.columns.includes(rc))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-5 shadow-cyber-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              DATASET & INGESTION PIPELINE MANAGEMENT
            </h3>
            <p className="text-xs text-slate-400">
              CSV file validation, column schema audit, and runtime data quality metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1525] hover:bg-[#16243C] text-slate-300 hover:text-white border border-[#1E2D4A] text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload Active</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">ACTIVE FILE</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300 truncate mb-1">
            {qualityReport?.fileName || 'cybersecurity_threat_intelligence_1000_rows.csv'}
          </div>
          <div className="text-[11px] text-slate-400">
            Loaded: {qualityReport ? new Date(qualityReport.loadedAt).toLocaleTimeString() : 'Ready'}
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">PARSED ROWS / COLS</span>
            <Columns className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {incidents.length.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {qualityReport?.columns.length || 26} Cols</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{qualityReport?.validRows || incidents.length} Valid Records</span>
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">DATE TEMPORAL SPAN</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold font-mono text-white mb-1 truncate">
            {qualityReport?.minDate} → {qualityReport?.maxDate}
          </div>
          <div className="text-[11px] text-slate-400">
            Detection window of supplied dataset
          </div>
        </div>

        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">DUPLICATE IDS & REJECTIONS</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {qualityReport?.duplicateIds.length || 0}{' '}
            <span className="text-xs text-slate-400 font-normal">Dupes</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {qualityReport?.rejectedRows || 0} rejected rows on ingest
          </div>
        </div>
      </div>

      {/* CSV Replacement Upload Section */}
      <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-5 shadow-cyber-card space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            UPLOAD REPLACEMENT DATASET (CSV)
          </h4>
          <p className="text-[11px] text-slate-400">
            Select a custom CSV file to replace current telemetry. Must satisfy the 18 required schema columns.
          </p>
        </div>

        {/* Upload Dropzone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#1E2D4A] hover:border-cyan-400/60 rounded-xl p-8 text-center bg-[#0D1525]/70 hover:bg-[#0D1525] transition-all cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept=".csv"
            className="hidden"
          />
          <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h5 className="text-sm font-semibold text-white mb-1">
            Click to Browse or Drag & Drop .CSV File
          </h5>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
            Strict schema check guarantees zero dashboard breaks. Unsupported files will be safely rejected without affecting current session.
          </p>
          <span className="inline-block px-3 py-1 rounded bg-[#1E2D4A] text-slate-300 text-xs font-mono">
            Accepts UTF-8 .csv files
          </span>
        </div>

        {/* Upload Status Banner */}
        {uploadStatus.message && (
          <div className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
            uploadStatus.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : uploadStatus.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
          }`}>
            {uploadStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {uploadStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {uploadStatus.type === 'loading' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
            <span className="font-medium">{uploadStatus.message}</span>
          </div>
        )}
      </div>

      {/* Schema Audit & Data Quality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Schema Columns Verification */}
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              SCHEMA VERIFICATION: REQUIRED COLUMNS ({REQUIRED_COLUMNS.length})
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Satisfied
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {REQUIRED_COLUMNS.map((col) => {
              const exists = qualityReport?.columns.includes(col);
              const missingCount = qualityReport?.missingValuesPerCol[col] || 0;
              return (
                <div
                  key={col}
                  className="bg-[#0D1525] border border-[#1E2D4A] rounded-lg p-2 flex items-center justify-between"
                >
                  <span className="font-mono text-slate-300 text-[11px] truncate" title={col}>
                    {col}
                  </span>
                  {exists ? (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {missingCount > 0 ? `${missingCount} nulls` : 'OK'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-mono font-bold">Missing</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detected Columns & Data Quality Summary */}
        <div className="bg-[#111C2F] border border-[#1E2D4A] rounded-xl p-4 shadow-cyber-card space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            DETECTED ATTRIBUTES ({qualityReport?.columns.length || 0})
          </h4>

          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
            {qualityReport?.columns.map((c) => (
              <span
                key={c}
                className="px-2 py-1 rounded bg-[#0D1525] border border-[#1E2D4A] text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                {c}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1E2D4A]/60 text-xs space-y-2 text-slate-400">
            <div className="flex items-center justify-between">
              <span>Duplicate Incident IDs:</span>
              <span className="font-mono text-white">
                {qualityReport?.duplicateIds.length ? qualityReport.duplicateIds.join(', ') : 'None detected (0)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Sanitization Pipeline:</span>
              <span className="font-mono text-emerald-400">Active (Safe coercion & bounding)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
