import { Incident } from '../types/incident';

export interface ThreatScatterPoint {
  threat: string;
  avgRisk: number; // 0 - 100 scaled for visualization
  avgImpact: number; // 1 - 10
  incidentCount: number;
  avgResponseTime: number;
  totalOutboundMB: number;
  totalAffectedUsers: number;
  topAttackVector: string;
  criticalCount: number;
  confirmedPct: number;
  color: string;
}

export interface AttackVectorBreakdown {
  vector: string;
  count: number;
  criticalCount: number;
  pct: number;
  topThreat: string;
}

export interface KillChainPhase {
  phase: string;
  count: number;
  criticalCount: number;
  avgRisk: number;
  topThreat: string;
  pct: number;
}

export interface HourlyAttackPattern {
  hour: number;
  hourLabel: string;
  count: number;
  criticalCount: number;
  isOffHours: boolean;
}

const THREAT_COLORS: Record<string, string> = {
  Ransomware: '#EF4444',
  Malware: '#F97316',
  'Data Exfiltration': '#EC4899',
  'Command and Control': '#8B5CF6',
  'Web Attack': '#3B82F6',
  DDoS: '#06B6D4',
  Phishing: '#10B981',
  'Suspicious Login': '#F59E0B',
  'Brute Force': '#6366F1',
  'Insider Threat': '#E11D48',
};

export function getThreatColor(threat: string): string {
  return THREAT_COLORS[threat] || '#38BDF8';
}

export function computeThreatScatterData(incidents: Incident[]): ThreatScatterPoint[] {
  const map: Record<string, {
    count: number;
    totalRisk: number;
    totalImpact: number;
    totalResponse: number;
    totalOutbound: number;
    totalUsers: number;
    criticalCount: number;
    confirmedCount: number;
    vectors: Record<string, number>;
  }> = {};

  incidents.forEach((inc) => {
    const t = inc.Threat_Type;
    if (!map[t]) {
      map[t] = {
        count: 0,
        totalRisk: 0,
        totalImpact: 0,
        totalResponse: 0,
        totalOutbound: 0,
        totalUsers: 0,
        criticalCount: 0,
        confirmedCount: 0,
        vectors: {},
      };
    }

    const item = map[t];
    item.count++;
    item.totalRisk += inc.Risk_Score;
    item.totalImpact += inc.Estimated_Impact_Score_1_10;
    item.totalResponse += inc.Response_Time_Minutes;
    item.totalOutbound += inc.Outbound_Data_MB;
    item.totalUsers += inc.Affected_Users;
    if (inc.Severity === 'Critical') item.criticalCount++;
    if (inc.Is_Confirmed_Threat) item.confirmedCount++;

    if (inc.Attack_Vector) {
      item.vectors[inc.Attack_Vector] = (item.vectors[inc.Attack_Vector] || 0) + 1;
    }
  });

  return Object.entries(map).map(([threat, data]) => {
    let topVec = 'Unknown';
    let topVecCount = 0;
    Object.entries(data.vectors).forEach(([v, c]) => {
      if (c > topVecCount) {
        topVec = v;
        topVecCount = c;
      }
    });

    return {
      threat,
      avgRisk: Math.round((data.totalRisk / data.count) * 100), // 0 - 100
      avgImpact: Math.round((data.totalImpact / data.count) * 10) / 10,
      incidentCount: data.count,
      avgResponseTime: Math.round((data.totalResponse / data.count) * 10) / 10,
      totalOutboundMB: Math.round(data.totalOutbound * 100) / 100,
      totalAffectedUsers: data.totalUsers,
      topAttackVector: topVec,
      criticalCount: data.criticalCount,
      confirmedPct: Math.round((data.confirmedCount / data.count) * 100),
      color: getThreatColor(threat),
    };
  }).sort((a, b) => b.incidentCount - a.incidentCount);
}

export function computeAttackVectorBreakdown(incidents: Incident[]): AttackVectorBreakdown[] {
  const map: Record<string, { count: number; criticalCount: number; threats: Record<string, number> }> = {};
  const total = incidents.length || 1;

  incidents.forEach((inc) => {
    const v = inc.Attack_Vector || 'Unknown Vector';
    if (!map[v]) {
      map[v] = { count: 0, criticalCount: 0, threats: {} };
    }
    map[v].count++;
    if (inc.Severity === 'Critical') map[v].criticalCount++;
    map[v].threats[inc.Threat_Type] = (map[v].threats[inc.Threat_Type] || 0) + 1;
  });

  return Object.entries(map).map(([vector, data]) => {
    let topT = 'Various';
    let topTCount = 0;
    Object.entries(data.threats).forEach(([t, c]) => {
      if (c > topTCount) {
        topT = t;
        topTCount = c;
      }
    });

    return {
      vector,
      count: data.count,
      criticalCount: data.criticalCount,
      pct: Math.round((data.count / total) * 100),
      topThreat: topT,
    };
  }).sort((a, b) => b.count - a.count);
}

export function computeKillChainProgression(incidents: Incident[]): KillChainPhase[] {
  // Ordered standard MITRE phases
  const orderedPhases = [
    'Initial Access',
    'Execution',
    'Persistence',
    'Lateral Movement',
    'Collection',
    'Exfiltration',
    'Impact',
  ];

  const map: Record<string, { count: number; criticalCount: number; totalRisk: number; threats: Record<string, number> }> = {};
  orderedPhases.forEach((p) => {
    map[p] = { count: 0, criticalCount: 0, totalRisk: 0, threats: {} };
  });

  incidents.forEach((inc) => {
    const phase = orderedPhases.find((p) => p.toLowerCase() === (inc.MITRE_Tactic || '').toLowerCase()) || inc.MITRE_Tactic;
    if (!map[phase]) {
      map[phase] = { count: 0, criticalCount: 0, totalRisk: 0, threats: {} };
    }
    map[phase].count++;
    map[phase].totalRisk += inc.Risk_Score;
    if (inc.Severity === 'Critical') map[phase].criticalCount++;
    map[phase].threats[inc.Threat_Type] = (map[phase].threats[inc.Threat_Type] || 0) + 1;
  });

  const total = incidents.length || 1;
  return Object.entries(map).map(([phase, data]) => {
    let topT = 'Various';
    let topTCount = 0;
    Object.entries(data.threats).forEach(([t, c]) => {
      if (c > topTCount) {
        topT = t;
        topTCount = c;
      }
    });

    return {
      phase,
      count: data.count,
      criticalCount: data.criticalCount,
      avgRisk: data.count > 0 ? Math.round((data.totalRisk / data.count) * 100) : 0,
      topThreat: topT,
      pct: Math.round((data.count / total) * 100),
    };
  });
}

export function computeHourlyAttackDensity(incidents: Incident[]): HourlyAttackPattern[] {
  const hourCounts: Record<number, { count: number; criticalCount: number }> = {};
  for (let h = 0; h < 24; h++) {
    hourCounts[h] = { count: 0, criticalCount: 0 };
  }

  incidents.forEach((inc) => {
    const h = typeof inc.Hour === 'number' && !isNaN(inc.Hour) ? inc.Hour : 0;
    const clampedHour = Math.min(23, Math.max(0, h));
    hourCounts[clampedHour].count++;
    if (inc.Severity === 'Critical') {
      hourCounts[clampedHour].criticalCount++;
    }
  });

  return Object.entries(hourCounts).map(([hStr, data]) => {
    const hour = parseInt(hStr, 10);
    const isOffHours = hour >= 20 || hour <= 6;
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

    return {
      hour,
      hourLabel,
      count: data.count,
      criticalCount: data.criticalCount,
      isOffHours,
    };
  }).sort((a, b) => a.hour - b.hour);
}

export interface ThreatDossier {
  threat: string;
  count: number;
  pct: number;
  confirmedCount: number;
  confirmedPct: number;
  avgRiskScore: number;
  avgImpactScore: number;
  avgResponseMinutes: number;
  totalOutboundMB: number;
  totalAffectedUsers: number;
  criticalCount: number;
  highCount: number;
  topAssets: { asset: string; count: number }[];
  topDepartments: { department: string; count: number }[];
  topVectors: { vector: string; count: number }[];
  topTactics: { tactic: string; count: number }[];
  sampleIncidents: Incident[];
}

export function computeThreatDossier(incidents: Incident[], targetThreat: string): ThreatDossier {
  const filtered = targetThreat === 'All' 
    ? incidents 
    : incidents.filter((i) => i.Threat_Type === targetThreat);

  const total = incidents.length || 1;
  const count = filtered.length;

  let totalRisk = 0;
  let totalImpact = 0;
  let totalResponse = 0;
  let totalOutbound = 0;
  let totalUsers = 0;
  let criticalCount = 0;
  let highCount = 0;
  let confirmedCount = 0;

  const assetMap: Record<string, number> = {};
  const deptMap: Record<string, number> = {};
  const vectorMap: Record<string, number> = {};
  const tacticMap: Record<string, number> = {};

  filtered.forEach((inc) => {
    totalRisk += inc.Risk_Score;
    totalImpact += inc.Estimated_Impact_Score_1_10;
    totalResponse += inc.Response_Time_Minutes;
    totalOutbound += inc.Outbound_Data_MB;
    totalUsers += inc.Affected_Users;
    if (inc.Severity === 'Critical') criticalCount++;
    if (inc.Severity === 'High') highCount++;
    if (inc.Is_Confirmed_Threat) confirmedCount++;

    assetMap[inc.Affected_Asset] = (assetMap[inc.Affected_Asset] || 0) + 1;
    deptMap[inc.Department] = (deptMap[inc.Department] || 0) + 1;
    vectorMap[inc.Attack_Vector] = (vectorMap[inc.Attack_Vector] || 0) + 1;
    tacticMap[inc.MITRE_Tactic] = (tacticMap[inc.MITRE_Tactic] || 0) + 1;
  });

  const getTopN = (map: Record<string, number>, n = 3) => {
    return Object.entries(map)
      .map(([name, c]) => ({ name, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  };

  return {
    threat: targetThreat,
    count,
    pct: count > 0 ? Math.round((count / total) * 100) : 0,
    confirmedCount,
    confirmedPct: count > 0 ? Math.round((confirmedCount / count) * 100) : 0,
    avgRiskScore: count > 0 ? Math.round((totalRisk / count) * 100) / 100 : 0,
    avgImpactScore: count > 0 ? Math.round((totalImpact / count) * 10) / 10 : 0,
    avgResponseMinutes: count > 0 ? Math.round((totalResponse / count) * 10) / 10 : 0,
    totalOutboundMB: Math.round(totalOutbound * 100) / 100,
    totalAffectedUsers: totalUsers,
    criticalCount,
    highCount,
    topAssets: getTopN(assetMap).map((item) => ({ asset: item.name, count: item.count })),
    topDepartments: getTopN(deptMap).map((item) => ({ department: item.name, count: item.count })),
    topVectors: getTopN(vectorMap).map((item) => ({ vector: item.name, count: item.count })),
    topTactics: getTopN(tacticMap).map((item) => ({ tactic: item.name, count: item.count })),
    sampleIncidents: filtered.slice(0, 5),
  };
}
