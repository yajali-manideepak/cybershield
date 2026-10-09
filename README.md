# CyberShield — Cybersecurity & Threat Intelligence Dashboard

> **DEMO ENVIRONMENT NOTICE:** This application operates on a **synthetic demonstration dataset** (`cybersecurity_threat_intelligence_1000_rows.csv`, 1,000 incident records) for educational, evaluation, and hackathon demonstration purposes. It is **not** connected to live security appliances or external threat feeds, and does not claim to detect live malicious attacks or verify real-world attribution.

---

## 🛡️ Project Overview

**CyberShield** is an interactive Security Operations Center (SOC) analytics and threat intelligence dashboard built for security analysts, incident response teams, and leadership. It facilitates multi-dimensional exploration of security incidents, attack surfaces, MITRE ATT&CK tactic alignments, and response SLA metrics.

### Key Capabilities
* **Interactive Overview SOC Dashboard:** 6 dynamic KPI cards and 8 Recharts visualizers (temporal activity, threat types, severity donut, lifecycle status, MITRE tactics, geographic distribution, response times, and threat-vs-severity breakdowns).
* **Threat Analysis & Attack Dynamics:** Dedicated security analysis module featuring:
  * **1-Click Threat Analysis Scenarios:** Quick investigative presets for *All Telemetry*, *Ransomware & Malware Outbreak*, *Data Exfiltration & Insider Threat*, *DDoS & Web Assault*, and *Critical Severity Triage*.
  * **MITRE ATT&CK Enterprise Kill-Chain Progression:** Visual tactical pipeline mapping incidents across 7 chronological lifecycle phases (*Initial Access* → *Execution* → *Persistence* → *Lateral Movement* → *Collection* → *Exfiltration* → *Impact*).
  * **24-Hour Diurnal Attack Density:** Hourly temporal rhythm chart with automatic off-hours/night shift compromise calculation.
  * **Ingress Attack Vector Rankings:** Pathway volume comparison with primary threat correlations.
  * **Interactive Threat Profile Dossier & Target Surface:** Category selector pills, blast radius metrics (Outbound MB & Impacted Users), top targeted assets, top impacted departments, and clickable sample incidents.
* **Multi-Attribute Filter Console:** Real-time cross-filtering by date window, severity, threat vector, status, department, asset, and region with instant reactivity across all cards and charts.
* **Threat Intelligence Module:** Correlation analysis of synthetic threat indicator matches (Known Malicious IP, Botnet Indicator, Vulnerability Advisory) and confidence distributions.
* **Incident Explorer:** Sortable, paginated (10/25/50/100) tabular view with global keyword search, deep-dive modal inspection displaying all 26 schema attributes, and filtered CSV export.
* **Incident Response Analytics:** Mean and median response times, SLA metrics, longest-response triage, and high-severity investigation queues.
* **Data Management & Ingestion Pipeline:** Runtime schema validation against 18 required columns, missing value tracking, duplicate detection, replacement CSV upload, and one-click reset to default synthetic dataset.
* **Executive CSV Reporting & Print Support:** Export filtered incidents or executive summary metrics, and print-ready CSS layout.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or later (v20+ recommended)
* **npm**: v9.0.0 or later

### Installation & Launch

1. Clone or navigate to the repository directory:
   ```bash
   cd cybersecurity
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

### Production Build & Preview
To compile the TypeScript project and generate an optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 18 with TypeScript
* **Build Tool:** Vite 5
* **Styling & Theme:** Tailwind CSS v3 with custom SOC dark navy palette (`#080D18`, `#0D1525`, `#111C2F`, `#38BDF8`, `#EF4444`)
* **Visualizations:** Recharts 2
* **Iconography:** Lucide React
* **Data Ingestion:** Papa Parse (client-side streaming and parsing)
* **Date Utilities:** date-fns

---

## 📊 Dataset Schema (26 Attributes)

The application ingests and validates the supplied 1,000-row synthetic dataset:
* `Incident_ID` *(Required)*: Unique identifier (e.g. `INC-00001`)
* `Timestamp` / `Date` *(Required)*: ISO 8601 detection timestamp
* `Hour`, `Month`, `Day_of_Week`: Time dimension attributes
* `Threat_Type` *(Required)*: Malware, Phishing, Brute Force, DDoS, Ransomware, Suspicious Login, Data Exfiltration, Web Attack, Insider Threat, Command and Control
* `Severity` *(Required)*: Low, Medium, High, Critical
* `Risk_Score` *(Required)*: Normalized float score between `0.00` and `1.00`
* `Source_System` *(Required)*: Firewall, IDS/IPS, SIEM, EDR, Email Security, Cloud Security, Identity Provider
* `Affected_Asset` *(Required)*: VPN Gateway, Database Server, Employee Laptop, Cloud Workload, File Server, Domain Controller
* `Department` *(Required)*: HR, Sales, Operations, Research, IT, Finance, Customer Support
* `Attack_Vector` *(Required)*: Ingress vector classification
* `MITRE_Tactic` *(Required)*: Illustrative MITRE ATT&CK framework mapping
* `Threat_Intelligence_Match` *(Required)*: Simulated indicator correlation
* `Intel_Confidence_Pct` *(Required)*: Indicator confidence level (0–100%)
* `Source_Country` / `Source_Region` *(Required)*: Simulated geographic origin
* `Status` *(Required)*: Blocked, Contained, Investigating, Resolved, False Positive, Escalated
* `Response_Time_Minutes` *(Required)*: Response latency in minutes
* `Estimated_Impact_Score_1_10`: Impact rating
* `Outbound_Data_MB`: Exfiltrated/transmitted data estimate
* `Affected_Users`: Impacted user accounts
* `Is_Confirmed_Threat` *(Required)*: Synthetic boolean confirmation flag
* `Analyst_ID`: Assigned SOC investigator code
* `Notes`: Synthetic investigation summary

---

## 🔒 Security & Privacy Notice
* **Client-side only processing:** Telemetry parsing and aggregation happen entirely within the browser.
* **No external API keys, tracking tokens, or paid third-party dependencies required.**
* **Purely synthetic demonstration data:** Does not connect to live operational endpoints.
