import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { ThreatAnalysisPage } from './pages/ThreatAnalysisPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { IncidentExplorerPage } from './pages/IncidentExplorerPage';
import { ResponseAnalyticsPage } from './pages/ResponseAnalyticsPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { Toast } from './components/Toast';
import { Shield, AlertCircle, RefreshCw, Upload } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { 
    activePage, 
    selectedIncident, 
    setSelectedIncident, 
    isLoading, 
    loadError,
    refreshData,
    setActivePage
  } = useDashboard();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#080D18] text-[#F8FAFC]">
      {/* Top Navbar */}
      <Navbar 
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {isLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Ingesting Incident Telemetry
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Parsing CSV schema, verifying 26 attributes & validating security constraints...
              </p>
            </div>
          ) : loadError ? (
            <div className="max-w-xl mx-auto my-12 bg-[#111C2F] border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Dataset Load Warning
              </h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {loadError}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={refreshData}
                  className="px-4 py-2 rounded-lg bg-[#1E2D4A] hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                >
                  Retry Loading
                </button>
                <button
                  onClick={() => setActivePage('data-mgmt')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV Manually</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              {activePage === 'overview' && <OverviewPage />}
              {activePage === 'threat-analysis' && <ThreatAnalysisPage />}
              {activePage === 'threat-intel' && <ThreatIntelPage />}
              {activePage === 'explorer' && <IncidentExplorerPage />}
              {activePage === 'response' && <ResponseAnalyticsPage />}
              {activePage === 'data-mgmt' && <DataManagementPage />}
            </div>
          )}
        </main>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default App;
