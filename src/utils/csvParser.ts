import Papa from 'papaparse';
import { Incident, DataQualityReport, SeverityLevel, IncidentStatus } from '../types/incident';

export const REQUIRED_COLUMNS = [
  'Incident_ID',
  'Timestamp',
  'Date',
  'Threat_Type',
  'Severity',
  'Risk_Score',
  'Source_System',
  'Affected_Asset',
  'Department',
  'Attack_Vector',
  'MITRE_Tactic',
  'Threat_Intelligence_Match',
  'Intel_Confidence_Pct',
  'Source_Country',
  'Source_Region',
  'Status',
  'Response_Time_Minutes',
  'Is_Confirmed_Threat'
];

export interface ParseResult {
  incidents: Incident[];
  report: DataQualityReport;
  error?: string;
}

export function parseCSVData(csvString: string, fileName: string = 'cybersecurity_threat_intelligence_1000_rows.csv'): ParseResult {
  const result = Papa.parse<Record<string, any>>(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false, // Parse ourselves for robust validation
  });

  if (result.errors && result.errors.length > 0 && (!result.data || result.data.length === 0)) {
    return {
      incidents: [],
      report: {
        fileName,
        totalParsed: 0,
        validRows: 0,
        rejectedRows: result.errors.length,
        rejectedReasons: result.errors.map((e, idx) => ({ row: e.row ?? idx, error: e.message })),
        duplicateIds: [],
        missingValuesPerCol: {},
        columns: [],
        minDate: '',
        maxDate: '',
        loadedAt: new Date().toISOString(),
      },
      error: `CSV parsing failed: ${result.errors[0].message}`,
    };
  }

  const columns = result.meta.fields || [];
  
  // Verify required columns
  const missingRequired = REQUIRED_COLUMNS.filter(col => !columns.includes(col));
  if (missingRequired.length > 0) {
    return {
      incidents: [],
      report: {
        fileName,
        totalParsed: result.data.length,
        validRows: 0,
        rejectedRows: result.data.length,
        rejectedReasons: [{ row: 0, error: `Missing required columns: ${missingRequired.join(', ')}` }],
        duplicateIds: [],
        missingValuesPerCol: {},
        columns,
        minDate: '',
        maxDate: '',
        loadedAt: new Date().toISOString(),
      },
      error: `Missing required columns: ${missingRequired.join(', ')}`,
    };
  }

  const incidents: Incident[] = [];
  const rejectedReasons: { row: number; error: string }[] = [];
  const missingValuesPerCol: Record<string, number> = {};
  columns.forEach(c => (missingValuesPerCol[c] = 0));

  const seenIds = new Set<string>();
  const duplicateIdsSet = new Set<string>();
  let minDate = '';
  let maxDate = '';

  result.data.forEach((row, index) => {
    const rowNum = index + 2; // 1-based index including header

    // Check empty row
    const id = row['Incident_ID']?.toString().trim();
    if (!id) {
      rejectedReasons.push({ row: rowNum, error: 'Empty Incident_ID' });
      return;
    }

    if (seenIds.has(id)) {
      duplicateIdsSet.add(id);
    } else {
      seenIds.add(id);
    }

    // Tally missing values
    columns.forEach(col => {
      const val = row[col];
      if (val === undefined || val === null || val === '') {
        missingValuesPerCol[col] = (missingValuesPerCol[col] || 0) + 1;
      }
    });

    // Validate and parse Severity
    const rawSeverity = (row['Severity'] || '').toString().trim();
    let severity: SeverityLevel = 'Medium';
    const lowerSev = rawSeverity.toLowerCase();
    if (lowerSev === 'critical') severity = 'Critical';
    else if (lowerSev === 'high') severity = 'High';
    else if (lowerSev === 'medium') severity = 'Medium';
    else if (lowerSev === 'low') severity = 'Low';
    else {
      // Default to medium if missing or unrecognized, but log if invalid
      if (rawSeverity) severity = 'Medium';
    }

    // Validate and parse Status
    const rawStatus = (row['Status'] || '').toString().trim();
    let status: IncidentStatus = 'Investigating';
    const lowerStatus = rawStatus.toLowerCase();
    if (lowerStatus === 'blocked') status = 'Blocked';
    else if (lowerStatus === 'contained') status = 'Contained';
    else if (lowerStatus === 'investigating') status = 'Investigating';
    else if (lowerStatus === 'resolved') status = 'Resolved';
    else if (lowerStatus === 'false positive') status = 'False Positive';
    else if (lowerStatus === 'escalated') status = 'Escalated';

    // Parse Risk_Score
    const riskScoreRaw = parseFloat(row['Risk_Score']);
    const riskScore = isNaN(riskScoreRaw) ? 0.5 : Math.max(0, Math.min(1, riskScoreRaw));

    // Parse Response_Time_Minutes
    const respTimeRaw = parseFloat(row['Response_Time_Minutes']);
    const responseTime = isNaN(respTimeRaw) ? 0 : Math.max(0, respTimeRaw);

    // Parse Intel_Confidence_Pct
    const intelConfRaw = parseFloat(row['Intel_Confidence_Pct']);
    const intelConfidence = isNaN(intelConfRaw) ? 0 : Math.max(0, Math.min(100, intelConfRaw));

    // Parse Boolean Is_Confirmed_Threat
    const rawBool = (row['Is_Confirmed_Threat'] ?? '').toString().trim().toLowerCase();
    const isConfirmed = rawBool === 'true' || rawBool === '1' || rawBool === 'yes';

    // Dates
    const dateVal = row['Date'] || row['Timestamp'] || '';
    if (dateVal) {
      if (!minDate || dateVal < minDate) minDate = dateVal;
      if (!maxDate || dateVal > maxDate) maxDate = dateVal;
    }

    const incident: Incident = {
      Incident_ID: id,
      Timestamp: row['Timestamp'] || row['Date'] || '',
      Date: row['Date'] || row['Timestamp'] || '',
      Hour: parseInt(row['Hour'], 10) || 0,
      Month: row['Month'] || '',
      Day_of_Week: row['Day_of_Week'] || '',
      Threat_Type: row['Threat_Type'] || 'Unknown Threat',
      Severity: severity,
      Risk_Score: riskScore,
      Source_System: row['Source_System'] || 'Unknown System',
      Affected_Asset: row['Affected_Asset'] || 'Unknown Asset',
      Department: row['Department'] || 'General',
      Attack_Vector: row['Attack_Vector'] || 'Unknown Vector',
      MITRE_Tactic: row['MITRE_Tactic'] || 'Initial Access',
      Threat_Intelligence_Match: row['Threat_Intelligence_Match'] || 'No external match',
      Intel_Confidence_Pct: intelConfidence,
      Source_Country: row['Source_Country'] || 'Unknown Country',
      Source_Region: row['Source_Region'] || 'Global',
      Status: status,
      Response_Time_Minutes: responseTime,
      Estimated_Impact_Score_1_10: parseInt(row['Estimated_Impact_Score_1_10'], 10) || 1,
      Outbound_Data_MB: parseFloat(row['Outbound_Data_MB']) || 0.0,
      Affected_Users: parseInt(row['Affected_Users'], 10) || 0,
      Is_Confirmed_Threat: isConfirmed,
      Analyst_ID: row['Analyst_ID'] || 'AN-000',
      Notes: row['Notes'] || '',
    };

    incidents.push(incident);
  });

  const report: DataQualityReport = {
    fileName,
    totalParsed: result.data.length,
    validRows: incidents.length,
    rejectedRows: rejectedReasons.length,
    rejectedReasons,
    duplicateIds: Array.from(duplicateIdsSet),
    missingValuesPerCol,
    columns,
    minDate,
    maxDate,
    loadedAt: new Date().toISOString(),
  };

  return { incidents, report };
}
