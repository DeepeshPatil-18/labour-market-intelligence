import { EarlyWarningAlert, AlertType, AlertSeverity } from '../types';

const INITIAL_ALERTS: EarlyWarningAlert[] = [
  {
    id: 'ALT-2026-001',
    type: 'CRITICAL_SHORTAGE',
    severity: 'CRITICAL',
    state: 'Maharashtra',
    district: 'Nashik',
    entityName: 'CNC Operation & Multi-Axis Programming',
    entityType: 'SKILL',
    evidence: 'Active postings grew 38% MoM across 19 automotive components employers; local ITI annual seat capacity remains capped at 95 seats with 88% placement.',
    detectedDate: '2026-06-24',
    recommendedAction: 'Sanction 60 additional batch seats under PMKVY in Nashik Industrial Area and sponsor industry-partnered CNC simulator lab.'
  },
  {
    id: 'ALT-2026-002',
    type: 'EMERGING_SKILL',
    severity: 'HIGH',
    state: 'Maharashtra',
    district: 'Pune',
    entityName: 'Battery Management Systems (BMS) Calibration',
    entityType: 'SKILL',
    evidence: 'Appeared in 42 EV manufacturing job descriptions across 11 Tier-1 suppliers over the past 60 days, up from 4 postings in Q4 2025.',
    detectedDate: '2026-06-20',
    recommendedAction: 'Develop 6-week NSQF Level 5 bridge curriculum for existing automotive electrical technicians.'
  },
  {
    id: 'ALT-2026-003',
    type: 'DEMAND_ACCELERATION',
    severity: 'HIGH',
    state: 'Karnataka',
    district: 'Bengaluru',
    entityName: 'Cloud DevOps & Kubernetes Orchestration',
    entityType: 'SKILL',
    evidence: 'Monthly vacancy postings accelerated +52% MoM (840 open roles) with median offered salary rising 14% over two consecutive quarters.',
    detectedDate: '2026-06-18',
    recommendedAction: 'Engage NASSCOM SSC to fast-track public university final-year cloud apprentice cohorts.'
  },
  {
    id: 'ALT-2026-004',
    type: 'CRITICAL_SHORTAGE',
    severity: 'CRITICAL',
    state: 'Tamil Nadu',
    district: 'Chennai',
    entityName: 'SMT Electronic Assembly Line Technician',
    entityType: 'OCCUPATION',
    evidence: 'Three mobile handset manufacturing clusters reported 220 unfulfilled technician roles lasting >45 days on job portals.',
    detectedDate: '2026-06-15',
    recommendedAction: 'Direct State Skill Mission to mobilize rural ITI electronics trade diplomates for 3-week conversion bootcamp.'
  },
  {
    id: 'ALT-2026-005',
    type: 'OVERSUPPLY_RISK',
    severity: 'MEDIUM',
    state: 'Uttar Pradesh',
    district: 'Kanpur',
    entityName: 'Basic Data Entry & Desktop Publishing',
    entityType: 'SKILL',
    evidence: 'Local private training centres graduated 1,420 candidates this year against an observed district demand of 160 active vacancies; placement dropped below 28%.',
    detectedDate: '2026-06-10',
    recommendedAction: 'Transition 50% of subsidized data-entry training seats toward Business Process Digitization and Logistics Inventory Tracking.'
  },
  {
    id: 'ALT-2026-006',
    type: 'DEMAND_DECLINE',
    severity: 'LOW',
    state: 'Gujarat',
    district: 'Surat',
    entityName: 'Manual Loom Weaving & Yarn Spooling',
    entityType: 'OCCUPATION',
    evidence: 'Posting volume dropped 34% over 90 days as textile processing units accelerated adoption of automated circular knitting looms.',
    detectedDate: '2026-06-05',
    recommendedAction: 'Initiate worker reskilling transition to Automated Loom Maintenance and Textile Quality Assurance.'
  },
  {
    id: 'ALT-2026-007',
    type: 'EMERGING_SKILL',
    severity: 'HIGH',
    state: 'Haryana',
    district: 'Gurugram',
    entityName: 'Solar PV Microgrid SCADA Automation',
    entityType: 'SKILL',
    evidence: 'New renewable energy microgrid contracts generated 65 new technical postings; zero certified training programs currently active in district.',
    detectedDate: '2026-05-28',
    recommendedAction: 'Issue immediate EoI for NSDC accredited training partner in green hydrogen and solar automation.'
  },
  {
    id: 'ALT-2026-008',
    type: 'CRITICAL_SHORTAGE',
    severity: 'CRITICAL',
    state: 'Madhya Pradesh',
    district: 'Indore',
    entityName: 'Pharmaceutical Cleanroom Formulation Operator',
    entityType: 'OCCUPATION',
    evidence: 'Pithampur Pharma SEZ expansion demands 340 sterile manufacturing operators; local training supply accounts for only 85 certified candidates annually.',
    detectedDate: '2026-05-22',
    recommendedAction: 'Establish dual-training system pairing regional pharmacy institutes directly with Pithampur pharma manufacturers.'
  }
];

export const alertService = {
  async getEarlyWarnings(filter?: {
    state?: string;
    district?: string;
    type?: string;
    severity?: string;
  }): Promise<EarlyWarningAlert[]> {
    let alerts = [...INITIAL_ALERTS];

    if (filter?.state && filter.state !== 'ALL') {
      alerts = alerts.filter(a => a.state.toLowerCase() === filter.state!.toLowerCase());
    }
    if (filter?.district && filter.district !== 'ALL') {
      alerts = alerts.filter(a => a.district.toLowerCase() === filter.district!.toLowerCase());
    }
    if (filter?.type && filter.type !== 'ALL') {
      alerts = alerts.filter(a => a.type === filter.type);
    }
    if (filter?.severity && filter.severity !== 'ALL') {
      alerts = alerts.filter(a => a.severity === filter.severity);
    }

    return alerts;
  },

  async acknowledgeAlert(id: string): Promise<boolean> {
    const alert = INITIAL_ALERTS.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }
};
