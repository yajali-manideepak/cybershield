import Papa from 'papaparse';
import { Incident, KPIStats, AutomaticInsights } from '../types/incident';

export function downloadCSV(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportIncidentsToCSV(incidents: Incident[], fileNamePrefix: string = 'cybershield_incidents') {
  if (incidents.length === 0) {
    throw new Error('No incident records to export.');
  }

  const csv = Papa.unparse(incidents, {
    quotes: true,
    header: true,
  });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  downloadCSV(csv, `${fileNamePrefix}_${timestamp}.csv`);
}

export function exportSummaryReportToCSV(
  kpis: KPIStats,
  insights: AutomaticInsights,
  totalFiltered: number,
  totalLoaded: number
) {
  const reportData = [
    { Section: 'Report Metadata', Metric: 'Generated At', Value: new Date().toISOString() },
    { Section: 'Report Metadata', Metric: 'Environment', Value: 'DEMO / Synthetic Dataset' },
    { Section: 'Report Metadata', Metric: 'Total Loaded Incidents', Value: totalLoaded },
    { Section: 'Report Metadata', Metric: 'Filtered Incidents', Value: totalFiltered },
    
    { Section: 'Key Performance Indicators', Metric: 'Total Filtered Incidents', Value: kpis.totalIncidents },
    { Section: 'Key Performance Indicators', Metric: 'Critical Incidents', Value: kpis.criticalIncidents },
    { Section: 'Key Performance Indicators', Metric: 'High or Critical Incidents', Value: kpis.highRiskIncidents },
    { Section: 'Key Performance Indicators', Metric: 'Confirmed Threats (Flagged)', Value: kpis.confirmedThreats },
    { Section: 'Key Performance Indicators', Metric: 'Average Response Time (min)', Value: kpis.avgResponseTime },
    { Section: 'Key Performance Indicators', Metric: 'Median Response Time (min)', Value: kpis.medianResponseTime ?? 'N/A' },
    { Section: 'Key Performance Indicators', Metric: 'Average Risk Score (0-1)', Value: kpis.avgRiskScore },

    { Section: 'Automated Observations', Metric: 'Most Common Threat', Value: `${insights.mostCommonThreat.name} (${insights.mostCommonThreat.count} incidents, ${insights.mostCommonThreat.pct}%)` },
    { Section: 'Automated Observations', Metric: 'Most Frequent Severity', Value: `${insights.mostFrequentSeverity.name} (${insights.mostFrequentSeverity.count} incidents, ${insights.mostFrequentSeverity.pct}%)` },
    { Section: 'Automated Observations', Metric: 'Threat Intel Coverage', Value: `${insights.threatIntelCoveragePct}% (${insights.threatIntelMatchCount} matches)` },
    { Section: 'Automated Observations', Metric: 'Top Source Region', Value: `${insights.topRegion.name} (${insights.topRegion.count} incidents)` },
    { Section: 'Automated Observations', Metric: 'Top Department Impacted', Value: `${insights.topDepartment.name} (${insights.topDepartment.count} incidents)` },
  ];

  if (insights.highestResponseThreat) {
    reportData.push({
      Section: 'Automated Observations',
      Metric: 'Highest Avg Response Threat',
      Value: `${insights.highestResponseThreat.name} (${insights.highestResponseThreat.avgTime} min across ${insights.highestResponseThreat.count} cases)`
    });
  }

  const csv = Papa.unparse(reportData, { quotes: true, header: true });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  downloadCSV(csv, `cybershield_summary_report_${timestamp}.csv`);
}
