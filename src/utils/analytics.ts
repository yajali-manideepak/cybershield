import { Incident, FilterState, KPIStats, AutomaticInsights } from '../types/incident';

export function applyFilters(incidents: Incident[], filters: FilterState): Incident[] {
  return incidents.filter(item => {
    // Search query across ID, notes, threat type, asset, tactic, country, analyst
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        item.Incident_ID.toLowerCase().includes(q) ||
        item.Threat_Type.toLowerCase().includes(q) ||
        item.Affected_Asset.toLowerCase().includes(q) ||
        item.Department.toLowerCase().includes(q) ||
        item.Attack_Vector.toLowerCase().includes(q) ||
        item.MITRE_Tactic.toLowerCase().includes(q) ||
        item.Source_Country.toLowerCase().includes(q) ||
        item.Source_System.toLowerCase().includes(q) ||
        item.Analyst_ID.toLowerCase().includes(q) ||
        item.Notes.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Date range
    if (filters.dateStart && item.Date < filters.dateStart) return false;
    if (filters.dateEnd && item.Date > filters.dateEnd) return false;

    // Severity multi-select
    if (filters.severities.length > 0 && !filters.severities.includes(item.Severity)) {
      return false;
    }

    // Threat type multi-select
    if (filters.threatTypes.length > 0 && !filters.threatTypes.includes(item.Threat_Type)) {
      return false;
    }

    // Status multi-select
    if (filters.statuses.length > 0 && !filters.statuses.includes(item.Status)) {
      return false;
    }

    // Region multi-select
    if (filters.sourceRegions.length > 0 && !filters.sourceRegions.includes(item.Source_Region)) {
      return false;
    }

    // Source system multi-select
    if (filters.sourceSystems.length > 0 && !filters.sourceSystems.includes(item.Source_System)) {
      return false;
    }

    // Department multi-select
    if (filters.departments.length > 0 && !filters.departments.includes(item.Department)) {
      return false;
    }

    // Affected asset multi-select
    if (filters.affectedAssets.length > 0 && !filters.affectedAssets.includes(item.Affected_Asset)) {
      return false;
    }

    // Confirmed threat flag
    if (filters.confirmedThreatOnly !== undefined && filters.confirmedThreatOnly !== null) {
      if (item.Is_Confirmed_Threat !== filters.confirmedThreatOnly) return false;
    }

    return true;
  });
}

export function calculateKPIs(incidents: Incident[]): KPIStats {
  const total = incidents.length;
  if (total === 0) {
    return {
      totalIncidents: 0,
      criticalIncidents: 0,
      confirmedThreats: 0,
      avgResponseTime: 0,
      highRiskIncidents: 0,
      avgRiskScore: 0,
      medianResponseTime: 0,
    };
  }

  let criticalCount = 0;
  let confirmedCount = 0;
  let highRiskCount = 0;
  let totalResponseTime = 0;
  let totalRiskScore = 0;

  const responseTimes: number[] = [];

  for (const inc of incidents) {
    if (inc.Severity === 'Critical') criticalCount++;
    if (inc.Severity === 'High' || inc.Severity === 'Critical') highRiskCount++;
    if (inc.Is_Confirmed_Threat) confirmedCount++;
    totalResponseTime += inc.Response_Time_Minutes;
    totalRiskScore += inc.Risk_Score;
    responseTimes.push(inc.Response_Time_Minutes);
  }

  // Median response time
  responseTimes.sort((a, b) => a - b);
  const mid = Math.floor(responseTimes.length / 2);
  const medianResponseTime =
    responseTimes.length % 2 !== 0
      ? responseTimes[mid]
      : (responseTimes[mid - 1] + responseTimes[mid]) / 2;

  return {
    totalIncidents: total,
    criticalIncidents: criticalCount,
    confirmedThreats: confirmedCount,
    avgResponseTime: Math.round((totalResponseTime / total) * 10) / 10,
    highRiskIncidents: highRiskCount,
    avgRiskScore: Math.round((totalRiskScore / total) * 100) / 100,
    medianResponseTime: Math.round(medianResponseTime * 10) / 10,
  };
}

export function calculateInsights(incidents: Incident[]): AutomaticInsights {
  const total = incidents.length;
  if (total === 0) {
    return {
      mostCommonThreat: { name: 'None', count: 0, pct: 0 },
      mostFrequentSeverity: { name: 'None', count: 0, pct: 0 },
      highestResponseThreat: null,
      highAndCriticalCount: 0,
      highAndCriticalPct: 0,
      threatIntelCoveragePct: 0,
      threatIntelMatchCount: 0,
      topRegion: { name: 'None', count: 0, pct: 0 },
      topDepartment: { name: 'None', count: 0 },
      isSampleSufficient: false,
    };
  }

  // Threat Counts
  const threatCounts: Record<string, number> = {};
  const threatTimes: Record<string, { totalTime: number; count: number }> = {};
  const sevCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};
  const deptCounts: Record<string, number> = {};
  let intelMatches = 0;
  let highCrit = 0;

  incidents.forEach(inc => {
    threatCounts[inc.Threat_Type] = (threatCounts[inc.Threat_Type] || 0) + 1;
    if (!threatTimes[inc.Threat_Type]) {
      threatTimes[inc.Threat_Type] = { totalTime: 0, count: 0 };
    }
    threatTimes[inc.Threat_Type].totalTime += inc.Response_Time_Minutes;
    threatTimes[inc.Threat_Type].count += 1;

    sevCounts[inc.Severity] = (sevCounts[inc.Severity] || 0) + 1;
    regionCounts[inc.Source_Region] = (regionCounts[inc.Source_Region] || 0) + 1;
    deptCounts[inc.Department] = (deptCounts[inc.Department] || 0) + 1;

    if (inc.Severity === 'High' || inc.Severity === 'Critical') highCrit++;
    if (
      inc.Threat_Intelligence_Match &&
      inc.Threat_Intelligence_Match.toLowerCase() !== 'no external match'
    ) {
      intelMatches++;
    }
  });

  // Most common threat
  let topThreat = { name: 'None', count: 0 };
  Object.entries(threatCounts).forEach(([name, count]) => {
    if (count > topThreat.count) topThreat = { name, count };
  });

  // Highest response threat (minimum 3 records for significance)
  let highestRespThreat: { name: string; avgTime: number; count: number } | null = null;
  Object.entries(threatTimes).forEach(([name, data]) => {
    if (data.count >= 3) {
      const avg = Math.round((data.totalTime / data.count) * 10) / 10;
      if (!highestRespThreat || avg > highestRespThreat.avgTime) {
        highestRespThreat = { name, avgTime: avg, count: data.count };
      }
    }
  });

  // Top severity
  let topSev = { name: 'None', count: 0 };
  Object.entries(sevCounts).forEach(([name, count]) => {
    if (count > topSev.count) topSev = { name, count };
  });

  // Top region
  let topReg = { name: 'None', count: 0 };
  Object.entries(regionCounts).forEach(([name, count]) => {
    if (count > topReg.count) topReg = { name, count };
  });

  // Top department
  let topDep = { name: 'None', count: 0 };
  Object.entries(deptCounts).forEach(([name, count]) => {
    if (count > topDep.count) topDep = { name, count };
  });

  return {
    mostCommonThreat: {
      name: topThreat.name,
      count: topThreat.count,
      pct: Math.round((topThreat.count / total) * 100),
    },
    mostFrequentSeverity: {
      name: topSev.name,
      count: topSev.count,
      pct: Math.round((topSev.count / total) * 100),
    },
    highestResponseThreat: highestRespThreat,
    highAndCriticalCount: highCrit,
    highAndCriticalPct: Math.round((highCrit / total) * 100),
    threatIntelCoveragePct: Math.round((intelMatches / total) * 100),
    threatIntelMatchCount: intelMatches,
    topRegion: {
      name: topReg.name,
      count: topReg.count,
      pct: Math.round((topReg.count / total) * 100),
    },
    topDepartment: topDep,
    isSampleSufficient: total >= 10,
  };
}

export function aggregateActivityOverTime(
  incidents: Incident[],
  granularity: 'daily' | 'monthly' = 'daily'
) {
  const map: Record<string, number> = {};

  incidents.forEach(item => {
    let key = item.Date;
    if (granularity === 'monthly') {
      key = item.Date ? item.Date.substring(0, 7) : item.Month || 'Unknown';
    }
    map[key] = (map[key] || 0) + 1;
  });

  const sortedKeys = Object.keys(map).sort();
  return sortedKeys.map(dateKey => ({
    date: dateKey,
    incidents: map[dateKey],
  }));
}

export function aggregateThreatTypes(incidents: Incident[]) {
  const counts: Record<string, number> = {};
  incidents.forEach(i => {
    counts[i.Threat_Type] = (counts[i.Threat_Type] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      pct: incidents.length > 0 ? Math.round((count / incidents.length) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateSeverities(incidents: Incident[]) {
  const counts: Record<string, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  incidents.forEach(i => {
    if (counts[i.Severity] !== undefined) {
      counts[i.Severity]++;
    } else {
      counts[i.Severity] = (counts[i.Severity] || 0) + 1;
    }
  });

  const total = incidents.length || 1;
  return [
    { name: 'Low', count: counts['Low'] || 0, pct: Math.round(((counts['Low'] || 0) / total) * 100), color: '#38BDF8' },
    { name: 'Medium', count: counts['Medium'] || 0, pct: Math.round(((counts['Medium'] || 0) / total) * 100), color: '#FACC15' },
    { name: 'High', count: counts['High'] || 0, pct: Math.round(((counts['High'] || 0) / total) * 100), color: '#F97316' },
    { name: 'Critical', count: counts['Critical'] || 0, pct: Math.round(((counts['Critical'] || 0) / total) * 100), color: '#EF4444' },
  ];
}

export function aggregateStatuses(incidents: Incident[]) {
  const counts: Record<string, number> = {
    Blocked: 0,
    Contained: 0,
    Investigating: 0,
    Resolved: 0,
    'False Positive': 0,
    Escalated: 0,
  };

  incidents.forEach(i => {
    counts[i.Status] = (counts[i.Status] || 0) + 1;
  });

  const total = incidents.length || 1;
  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    pct: Math.round((count / total) * 100),
  })).sort((a, b) => b.count - a.count);
}

export function aggregateMitreTactics(incidents: Incident[]) {
  const counts: Record<string, number> = {};
  incidents.forEach(i => {
    counts[i.MITRE_Tactic] = (counts[i.MITRE_Tactic] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([tactic, count]) => ({ tactic, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateGeographicDistribution(incidents: Incident[], by: 'country' | 'region' = 'region') {
  const counts: Record<string, number> = {};
  incidents.forEach(i => {
    const key = by === 'country' ? i.Source_Country : i.Source_Region;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      pct: incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateResponseTimeBySeverity(incidents: Incident[]) {
  const groups: Record<string, { totalTime: number; count: number }> = {
    Low: { totalTime: 0, count: 0 },
    Medium: { totalTime: 0, count: 0 },
    High: { totalTime: 0, count: 0 },
    Critical: { totalTime: 0, count: 0 },
  };

  incidents.forEach(i => {
    if (groups[i.Severity]) {
      groups[i.Severity].totalTime += i.Response_Time_Minutes;
      groups[i.Severity].count += 1;
    }
  });

  return ['Low', 'Medium', 'High', 'Critical'].map(sev => {
    const data = groups[sev];
    const avg = data.count > 0 ? Math.round((data.totalTime / data.count) * 10) / 10 : 0;
    return {
      severity: sev,
      avgMinutes: avg,
      incidentCount: data.count,
    };
  });
}

export function aggregateThreatTypeVsSeverity(incidents: Incident[]) {
  const dataMap: Record<string, { Low: number; Medium: number; High: number; Critical: number; total: number }> = {};

  incidents.forEach(i => {
    if (!dataMap[i.Threat_Type]) {
      dataMap[i.Threat_Type] = { Low: 0, Medium: 0, High: 0, Critical: 0, total: 0 };
    }
    if (i.Severity in dataMap[i.Threat_Type]) {
      (dataMap[i.Threat_Type] as any)[i.Severity]++;
    }
    dataMap[i.Threat_Type].total++;
  });

  return Object.entries(dataMap)
    .map(([threat, counts]) => ({
      threat,
      Low: counts.Low,
      Medium: counts.Medium,
      High: counts.High,
      Critical: counts.Critical,
      total: counts.total,
    }))
    .sort((a, b) => b.total - a.total);
}
