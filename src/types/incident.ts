export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 
  | 'Blocked' 
  | 'Contained' 
  | 'Investigating' 
  | 'Resolved' 
  | 'False Positive' 
  | 'Escalated';

export interface Incident {
  Incident_ID: string;
  Timestamp: string;
  Date: string;
  Hour: number;
  Month: string;
  Day_of_Week: string;
  Threat_Type: string;
  Severity: SeverityLevel;
  Risk_Score: number;
  Source_System: string;
  Affected_Asset: string;
  Department: string;
  Attack_Vector: string;
  MITRE_Tactic: string;
  Threat_Intelligence_Match: string;
  Intel_Confidence_Pct: number;
  Source_Country: string;
  Source_Region: string;
  Status: IncidentStatus;
  Response_Time_Minutes: number;
  Estimated_Impact_Score_1_10: number;
  Outbound_Data_MB: number;
  Affected_Users: number;
  Is_Confirmed_Threat: boolean;
  Analyst_ID: string;
  Notes: string;
  [key: string]: any;
}

export interface FilterState {
  searchQuery: string;
  dateStart: string;
  dateEnd: string;
  severities: SeverityLevel[];
  threatTypes: string[];
  statuses: IncidentStatus[];
  sourceRegions: string[];
  sourceSystems: string[];
  departments: string[];
  affectedAssets: string[];
  confirmedThreatOnly?: boolean;
}

export interface KPIStats {
  totalIncidents: number;
  criticalIncidents: number;
  confirmedThreats: number;
  avgResponseTime: number;
  highRiskIncidents: number;
  avgRiskScore: number;
  medianResponseTime?: number;
}

export interface DataQualityReport {
  fileName: string;
  totalParsed: number;
  validRows: number;
  rejectedRows: number;
  rejectedReasons: { row: number; error: string }[];
  duplicateIds: string[];
  missingValuesPerCol: Record<string, number>;
  columns: string[];
  minDate: string;
  maxDate: string;
  loadedAt: string;
}

export interface AutomaticInsights {
  mostCommonThreat: { name: string; count: number; pct: number };
  mostFrequentSeverity: { name: string; count: number; pct: number };
  highestResponseThreat: { name: string; avgTime: number; count: number } | null;
  highAndCriticalCount: number;
  highAndCriticalPct: number;
  threatIntelCoveragePct: number;
  threatIntelMatchCount: number;
  topRegion: { name: string; count: number; pct: number };
  topDepartment: { name: string; count: number };
  isSampleSufficient: boolean;
}
