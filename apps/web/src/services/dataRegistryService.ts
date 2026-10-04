export interface DatasetRegistryEntry {
  id: string;
  datasetName: string;
  filename: string;
  purpose: string;
  sourceType: 'REFERENCE' | 'OBSERVED' | 'SYNTHETIC' | 'DEVELOPMENT' | 'MODELED' | 'POLICY';
  usedBy: string[];
  recordCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  citation: string;
}

export const DATA_REGISTRY: DatasetRegistryEntry[] = [
  {
    id: 'nco_2015',
    datasetName: 'National Classification of Occupations 2015 (NCO 2015)',
    filename: 'nco_2015_occupations.csv',
    purpose: 'Canonical occupation master reference, NCO codes, hierarchy, descriptions, QP/NOS references, and NSQF level alignment.',
    sourceType: 'REFERENCE',
    usedBy: ['LabourMarketPage', 'SkillFinderPage', 'SkillTransitionsPage', 'labourMarketService'],
    recordCount: 3448,
    status: 'ACTIVE',
    citation: 'Source: Directorate General of Employment — NCO 2015'
  },
  {
    id: 'plfs_2025_raw',
    datasetName: 'Periodic Labour Force Survey 2025 (PLFS 2025 Raw Indicators)',
    filename: 'plfs_2025_labour_indicators.csv',
    purpose: 'Official MoSPI macroeconomic labour baseline indicators (LFPR, WPR, UR, status shares, industry shares, NEET, youth UR).',
    sourceType: 'OBSERVED',
    usedBy: ['plfsService', 'LandingPage', 'OverviewPage'],
    recordCount: 126,
    status: 'ACTIVE',
    citation: 'Source: MoSPI — PLFS 2025'
  },
  {
    id: 'plfs_2025_curated',
    datasetName: 'PLFS 2025 Curated Frontend Indicators',
    filename: 'plfs_2025_indicators.json',
    purpose: 'Frontend-ready macro context indicators, national baseline charts, and sector distribution.',
    sourceType: 'OBSERVED',
    usedBy: ['plfsService', 'LandingPage'],
    recordCount: 126,
    status: 'ACTIVE',
    citation: 'Source: MoSPI — PLFS 2025'
  },
  {
    id: 'policy_signals',
    datasetName: 'National Skill Development Policy Signals',
    filename: 'policy_signals.json',
    purpose: 'Methodology and policy alignment: LMIS, HRP, Skill inventory, Demand-based planning, Employment outcomes.',
    sourceType: 'POLICY',
    usedBy: ['LandingPage', 'OverviewPage', 'TrainingAllocationPage'],
    recordCount: 9,
    status: 'ACTIVE',
    citation: 'Source: MSDE National Policy on Skill Development and Entrepreneurship'
  },
  {
    id: 'synthetic_skills',
    datasetName: 'Synthetic Skill Catalogue',
    filename: 'synthetic_skills.csv',
    purpose: 'Canonical technical and occupational skill master catalogue.',
    sourceType: 'SYNTHETIC',
    usedBy: ['labourMarketService', 'SkillTransitionsPage'],
    recordCount: 98,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_occupation_skills',
    datasetName: 'Synthetic Occupation-Skill Mapping Matrix',
    filename: 'synthetic_occupation_skills.csv',
    purpose: 'Occupation -> Skill competency relationships, skill graph matrix, and transition pathways.',
    sourceType: 'SYNTHETIC',
    usedBy: ['SkillTransitionsPage', 'labourMarketService'],
    recordCount: 12087,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_job_postings',
    datasetName: 'Synthetic Requisition Requisition Master',
    filename: 'synthetic_job_postings.csv',
    purpose: 'Microeconomic job posting requisitions, salary ranges, location, sector, and skill tags.',
    sourceType: 'SYNTHETIC',
    usedBy: ['labourMarketService', 'LabourMarketPage'],
    recordCount: 12000,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_demand_signals',
    datasetName: 'Synthetic Demand Signals Master',
    filename: 'synthetic_demand_signals.csv',
    purpose: 'Derived demand signal volume, MoM growth velocity, and employer counts by geography and skill.',
    sourceType: 'MODELED',
    usedBy: ['labourMarketService', 'EarlyWarningsPage', 'OverviewPage'],
    recordCount: 2701,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_supply_signals',
    datasetName: 'Synthetic Supply Signals Master',
    filename: 'synthetic_supply_signals.csv',
    purpose: 'Workforce and training supply availability, completion rates, and placement conversion proxies.',
    sourceType: 'MODELED',
    usedBy: ['labourMarketService', 'TrainingAllocationPage'],
    recordCount: 533,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_training_centres',
    datasetName: 'Synthetic Training Infrastructure Catalogue',
    filename: 'synthetic_training_centres.csv',
    purpose: 'Accredited ITIs, NSTIs, and training center infrastructure details.',
    sourceType: 'SYNTHETIC',
    usedBy: ['TrainingAllocationPage', 'trainingService'],
    recordCount: 120,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_training_programs',
    datasetName: 'Synthetic Training Courses & Programs',
    filename: 'synthetic_training_programs.csv',
    purpose: 'Training courses, program duration, NSQF levels, seat capacity, and skills covered.',
    sourceType: 'SYNTHETIC',
    usedBy: ['TrainingAllocationPage', 'trainingService'],
    recordCount: 600,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'state_profiles',
    datasetName: 'State Economic & Labour Profiles',
    filename: 'state_profiles.csv',
    purpose: 'State specializations, primary industries, priority skills, key industrial clusters, scale factors.',
    sourceType: 'DEVELOPMENT',
    usedBy: ['mapDataService', 'LabourMarketPage', 'IndiaChoroplethMap'],
    recordCount: 36,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'state_rollup',
    datasetName: 'State Labour Market Rollup',
    filename: 'state_labour_market_rollup.csv',
    purpose: 'DataMeet map status join, active postings (90d), employer count, growth %, shortage count, status.',
    sourceType: 'DEVELOPMENT',
    usedBy: ['IndiaChoroplethMap', 'mapDataService', 'OverviewPage'],
    recordCount: 36,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'state_sector_demand',
    datasetName: 'State Sector-Occupation Demand',
    filename: 'state_sector_occupation_demand.csv',
    purpose: 'State -> Sector -> Occupation demand volume breakdown.',
    sourceType: 'DEVELOPMENT',
    usedBy: ['LabourMarketPage', 'labourMarketService'],
    recordCount: 615,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'state_skill_supply',
    datasetName: 'State Skill Supply',
    filename: 'state_skill_supply.csv',
    purpose: 'State -> Skill training capacity, completion %, placement %, and effective supply.',
    sourceType: 'DEVELOPMENT',
    usedBy: ['TrainingAllocationPage', 'labourMarketService'],
    recordCount: 216,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'state_skill_gaps',
    datasetName: 'State Skill Gap Matrix',
    filename: 'state_skill_gaps.csv',
    purpose: 'State -> Skill demand, effective supply, gap units, gap %, shortage/oversupply status.',
    sourceType: 'DEVELOPMENT',
    usedBy: ['LabourMarketPage', 'TrainingAllocationPage', 'labourMarketService'],
    recordCount: 216,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  },
  {
    id: 'synthetic_job_evidence',
    datasetName: 'State Synthetic Job Requisition Evidence',
    filename: 'synthetic_job_evidence.csv',
    purpose: 'Requisition evidence by city, sector, occupation, and synthetic employer name.',
    sourceType: 'DEVELOPMENT',
    usedBy: ['LabourMarketPage', 'labourMarketService'],
    recordCount: 1798,
    status: 'ACTIVE',
    citation: 'Data: SIH Development Dataset'
  }
];

export const dataRegistryService = {
  getAllDatasets(): DatasetRegistryEntry[] {
    return DATA_REGISTRY;
  },

  getDatasetById(id: string): DatasetRegistryEntry | undefined {
    return DATA_REGISTRY.find(d => d.id === id);
  },

  getDatasetsBySourceType(sourceType: DatasetRegistryEntry['sourceType']): DatasetRegistryEntry[] {
    return DATA_REGISTRY.filter(d => d.sourceType === sourceType);
  }
};
