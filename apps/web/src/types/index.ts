export type DataStatusLabel = 
  | 'REFERENCE' 
  | 'OBSERVED' 
  | 'ESTIMATED' 
  | 'MODELED' 
  | 'FORECAST' 
  | 'DEVELOPMENT';

export interface DataProvenance {
  source: string;
  lastUpdated?: string;
  dataStatus: DataStatusLabel;
  coverage?: string;
  confidence?: number;
  methodology?: string;
}

export interface StateDistrictGeo {
  state: string;
  districts: string[];
}

export interface GlobalFilterState {
  state: string; // 'ALL' or state name
  district: string; // 'ALL' or district name
  sector: string; // 'ALL' or sector name
  timeHorizon: '3m' | '6m' | '12m';
  severity: string; // 'ALL' | 'Critical' | 'Shortage' | 'Balanced' | 'Oversupply'
  searchQuery: string;
}

export interface LabourKPIs {
  criticalShortagesCount: number;
  emergingSkillsCount: number;
  averageDemandIndex: number;
  trainingGapSeats: number;
  totalPostingsObserved: number;
  activeTrainingCentres: number;
  lastUpdatedDate: string;
}

export interface SkillDemandItem {
  rank: number;
  skill: string;
  category: string;
  demandIndex: number;
  jobPostings: number;
  employerCount: number;
  growthMoM: number;
  severity: 'Critical' | 'Shortage' | 'Moderate' | 'Low' | 'Balanced';
  topState: string;
  topDistrict: string;
}

export interface OccupationDemandItem {
  ncoCode: string;
  title: string;
  divisionTitle: string;
  subDivisionTitle: string;
  demandIndex: number;
  jobPostingsCount: number;
  topLocation: string;
  nsqfLevel: number | null;
  trend: 'Rising' | 'Stable' | 'Surging' | 'Declining';
}

export interface JobPostingRecord {
  jobId: string;
  jobTitle: string;
  company: string;
  state: string;
  district: string;
  description: string;
  skills: string[];
  experienceYears: number;
  salaryMin: number;
  salaryMax: number;
  postedDate: string;
  employmentType: string;
  sector: string;
  ncoCode: string;
  source: string;
  dataOrigin: string;
}

export type AlertType = 
  | 'CRITICAL_SHORTAGE' 
  | 'EMERGING_SKILL' 
  | 'DEMAND_ACCELERATION' 
  | 'OVERSUPPLY_RISK' 
  | 'DEMAND_DECLINE';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EarlyWarningAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  state: string;
  district: string;
  entityName: string;
  entityType: 'SKILL' | 'OCCUPATION';
  evidence: string;
  detectedDate: string;
  recommendedAction: string;
  acknowledged?: boolean;
}

export interface ForecastSectorProjection {
  sector: string;
  currentDemand: number;
  projectedDemand: number;
  currentSupply: number;
  projectedSupply: number;
  gapScore: number;
  status: 'Critical Shortage' | 'Shortage' | 'Balanced' | 'Oversupply';
}

export interface ForecastSummary {
  horizon: '3m' | '6m' | '12m';
  currentDemand: number;
  projectedDemand: number;
  currentSupply: number;
  projectedSupply: number;
  projectedGap: number;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  trendPoints: Array<{
    period: string;
    historical?: number;
    projectedDemand?: number;
    projectedSupply?: number;
    confidenceUpper?: number;
    confidenceLower?: number;
  }>;
  sectors: ForecastSectorProjection[];
}

export interface SkillGraphNode {
  id: string;
  name: string;
  category: string;
  nsqfLevel: number;
  demandIndex: number;
  shortageStatus: 'Critical' | 'Shortage' | 'Balanced';
  type: 'CURRENT' | 'RELATED' | 'BRIDGE' | 'TARGET';
}

export interface SkillGraphEdge {
  source: string;
  target: string;
  weight: number;
  label: string;
}

export interface TrainingRecommendationItem {
  programId: string;
  centreId: string;
  centreName: string;
  state: string;
  district: string;
  courseName: string;
  skillName: string;
  nsqfLevel: number;
  currentSeats: number;
  recommendedSeats: number;
  seatDifference: number;
  annualBudgetInr: number;
  estimatedImpact: string;
  reason: string;
  placementRate: number;
  completionRate: number;
}

export interface PLFSIndicatorRecord {
  indicator: string;
  year: string;
  geography: string;
  age_group: string;
  sex: string;
  category: string;
  unit: string;
  value: string;
  source_page?: string;
}

export interface NCOOccupationRecord {
  ncoCode: string;
  title: string;
  description: string;
  divisionCode: string;
  divisionTitle: string;
  subDivisionCode: string;
  subDivisionTitle: string;
  groupCode: string;
  groupTitle: string;
  familyCode: string;
  familyTitle: string;
  isco08Code: string;
  qpNosReference: string;
  qpNosName: string;
  nsqfLevel: number | null;
  nco2004Code: string;
  source: string;
  dataOrigin: string;
}
