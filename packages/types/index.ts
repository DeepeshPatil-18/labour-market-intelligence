// Labour Market Intelligence Platform — Core Type Definitions
// Shared across all packages

// ============================================================
// DATA CONNECTOR INTERFACES
// ============================================================

/** Status of a data connector health check */
export interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  lastChecked: Date;
  message?: string;
  latencyMs?: number;
}

/** Parameters for data fetching */
export interface FetchParams {
  /** Geographic filter */
  geography?: {
    country?: string;
    state?: string;
    district?: string;
  };
  /** Date range filter */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Pagination */
  page?: number;
  pageSize?: number;
  /** Skill/occupation filter */
  keywords?: string[];
  /** Maximum records to fetch */
  limit?: number;
}

/** Raw data batch from a connector */
export interface RawDataBatch<T> {
  source: string;
  fetchedAt: Date;
  records: T[];
  totalAvailable?: number;
  hasMore: boolean;
  rawMetadata?: Record<string, unknown>;
}

/** Result of a single ingestion run */
export interface IngestionResult {
  source: string;
  recordsFetched: number;
  recordsNormalized: number;
  recordsInserted: number;
  recordsSkipped: number;
  recordsFailed: number;
  errors: IngestionError[];
  durationMs: number;
  timestamp: Date;
}

/** Ingestion error detail */
export interface IngestionError {
  recordIndex?: number;
  field?: string;
  message: string;
  severity: 'warning' | 'error';
  rawRecord?: unknown;
}

/** Summary of a full ingestion run across all connectors */
export interface IngestionSummary {
  startedAt: Date;
  completedAt: Date;
  results: IngestionResult[];
  totalRecords: number;
  totalErrors: number;
}

/** Data source type classification */
export type DataSourceType =
  | 'reference'      // NCO, NSQF (static reference data)
  | 'labour_survey'  // PLFS (periodic survey data)
  | 'job_api'        // Adzuna, Jooble (job posting APIs)
  | 'government'     // NCS, e-Shram (government portals)
  | 'indicator'      // EPFO, Udyam, GeM (leading indicators)
  | 'geography'      // DataMeet (spatial data)
  | 'training'       // Training programme data
  | 'synthetic';     // Development/testing only

/**
 * Core connector interface.
 * Every data connector must implement this contract.
 *
 * @typeParam TRaw - The shape of raw records from this source
 */
export interface DataConnector<TRaw = unknown> {
  /** Unique connector name */
  readonly name: string;

  /** Source type classification */
  readonly sourceType: DataSourceType;

  /** Whether this connector is currently enabled */
  readonly isEnabled: boolean;

  /** Human-readable display name */
  readonly displayName: string;

  /**
   * Check if the connector is operational.
   * Must not throw — always return a ConnectorHealth object.
   */
  checkHealth(): Promise<ConnectorHealth>;

  /**
   * Fetch raw data from the external source.
   * Returns data in its original shape.
   */
  fetchRaw(params: FetchParams): Promise<RawDataBatch<TRaw>>;

  /**
   * Normalize raw records to the canonical internal schema.
   * This is where source-specific transformations happen.
   */
  normalize(raw: RawDataBatch<TRaw>): Promise<NormalizedRecord[]>;

  /**
   * Full ingestion pipeline: fetch → normalize → persist.
   * Handles errors gracefully and returns a result summary.
   */
  ingest(params: FetchParams): Promise<IngestionResult>;
}

// ============================================================
// NORMALIZED RECORDS
// ============================================================

/** Normalized job posting ready for database insertion */
export interface NormalizedJobPosting {
  externalId: string;
  title: string;
  employer?: string;
  description?: string;
  locationRaw?: string;
  state?: string;
  district?: string;
  postingDate?: Date;
  expiryDate?: Date;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  sector?: string;
  sourceUrl?: string;
  source: string;
}

/** Normalized labour indicator ready for database insertion */
export interface NormalizedLabourIndicator {
  indicator: string;
  year: number;
  period?: string;
  geographyRaw?: string;
  ageGroup?: string;
  sex?: string;
  category?: string;
  unit: string;
  value: number;
  dataOrigin: 'OBSERVED' | 'ESTIMATED' | 'MODELED';
  source: string;
  sourcePage?: string;
}

/** Normalized occupation record for NCO import */
export interface NormalizedOccupation {
  ncoCode: string;
  title: string;
  description?: string;
  divisionCode: string;
  divisionTitle: string;
  subDivisionCode: string;
  subDivisionTitle?: string;
  groupCode: string;
  groupTitle: string;
  familyCode: string;
  familyTitle?: string;
  isco08Code: string;
  isco08Title?: string;
  qpNosReference?: string;
  qpNosName?: string;
  nsqfLevel?: number;
  nco2004Code?: string;
  sourceVolume?: string;
  sourcePage?: string;
}

/** Generic normalized record (union type for the pipeline) */
export type NormalizedRecord =
  | { type: 'job_posting'; data: NormalizedJobPosting }
  | { type: 'labour_indicator'; data: NormalizedLabourIndicator }
  | { type: 'occupation'; data: NormalizedOccupation }
  | { type: 'geography'; data: NormalizedGeography }
  | { type: 'training_program'; data: NormalizedTrainingProgram };

/** Normalized geography record */
export interface NormalizedGeography {
  name: string;
  code: string;
  level: 'COUNTRY' | 'STATE' | 'DISTRICT';
  parentCode?: string;
  population?: number;
  lgdCode?: string;
}

/** Normalized training program */
export interface NormalizedTrainingProgram {
  name: string;
  provider?: string;
  duration?: string;
  seats?: number;
  nsqfLevel?: number;
  skills?: string[];
  centreName?: string;
  centreDistrict?: string;
}

// ============================================================
// AI PROVIDER INTERFACE
// ============================================================

/** Extracted skill from unstructured text */
export interface ExtractedSkill {
  name: string;
  confidence: number;
  rawText: string;         // Original text matched
  category?: SkillCategoryType;
}

export type SkillCategoryType = 'TECHNICAL' | 'SOFT' | 'DOMAIN' | 'TOOL' | 'CERTIFICATION';

/** Result of normalizing a raw skill to canonical form */
export interface NormalizedSkill {
  canonical: string;
  confidence: number;
  matchedAlias?: string;
}

/** Result of mapping a job to an NCO occupation */
export interface OccupationMapping {
  ncoCode: string;
  title: string;
  confidence: number;
  reasoning?: string;
}

/** Context for explanation generation */
export interface ExplanationContext {
  type: 'skill_gap' | 'forecast' | 'alert' | 'training_recommendation' | 'skill_transition';
  data: Record<string, unknown>;
  audience: 'government' | 'public';
}

/**
 * AI Provider abstraction.
 * Allows swapping between LLM providers (OpenAI, Gemini, etc.)
 */
export interface AIProvider {
  readonly name: string;

  /** Extract skills from a job description or text block */
  extractSkills(text: string): Promise<ExtractedSkill[]>;

  /** Normalize a raw skill name to a canonical skill */
  normalizeSkill(raw: string, candidates: string[]): Promise<NormalizedSkill>;

  /** Map a job title + description to an NCO occupation */
  mapToOccupation(
    title: string,
    description: string,
    candidateOccupations?: Array<{ ncoCode: string; title: string }>
  ): Promise<OccupationMapping>;

  /** Generate a human-readable explanation */
  generateExplanation(context: ExplanationContext): Promise<string>;

  /** Compute embedding vector for semantic search */
  computeEmbedding(text: string): Promise<number[]>;
}

// ============================================================
// INTELLIGENCE ENGINE INTERFACES
// ============================================================

/** Demand Engine configuration */
export interface DemandConfig {
  weights: {
    postingVolume: number;
    postingGrowth: number;
    employerCount: number;
    skillFrequency: number;
    geographicConcentration: number;
    salarySignal: number;
    leadingIndicators: number;
  };
  normalizationMethod: 'min_max' | 'z_score' | 'percentile';
}

/** Skill gap thresholds (configurable) */
export interface GapThresholds {
  criticalShortage: number;   // e.g. 0.6
  shortage: number;           // e.g. 0.3
  oversupply: number;         // e.g. -0.3
  criticalOversupply: number; // e.g. -0.6
}

/** Forecast configuration */
export interface ForecastConfig {
  horizons: ('3m' | '6m' | '12m')[];
  methods: ('exponential_smoothing' | 'linear_trend' | 'arima')[];
  minimumDataPoints: number;  // Minimum historical points required
  confidenceLevel: number;    // e.g. 0.95
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

/** Standard API response envelope */
export interface ApiResponse<T> {
  data: T;
  metadata: ResponseMetadata;
  pagination?: PaginationInfo;
}

/** Metadata attached to every API response */
export interface ResponseMetadata {
  source: string;
  lastUpdated: string;
  dataOrigin: 'observed' | 'estimated' | 'forecast' | 'synthetic';
  coverage?: string;
  confidence?: number;
  methodology?: string;
}

/** Pagination info */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// ============================================================
// ERROR / STATE TYPES
// ============================================================

/** Data availability state for UI */
export type DataAvailability =
  | 'available'
  | 'loading'
  | 'empty'
  | 'insufficient'       // Not enough data for reliable analysis
  | 'unavailable'        // Source not connected
  | 'error';             // API/processing failure

export interface DataState<T> {
  status: DataAvailability;
  data?: T;
  message?: string;
  lastAttempt?: Date;
}
