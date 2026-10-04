/**
 * Adzuna Job Posting Connector
 *
 * Fetches job postings from the Adzuna API for India.
 * https://developer.adzuna.com/
 *
 * STATUS: Stub — requires ADZUNA_APP_ID and ADZUNA_APP_KEY.
 */

import type {
  DataConnector,
  DataSourceType,
  FetchParams,
  RawDataBatch,
  NormalizedRecord,
  NormalizedJobPosting,
  ConnectorHealth,
  IngestionResult,
} from '../../types';

/** Adzuna API response shape (simplified) */
interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  description: string;
  location: { display_name: string; area: string[] };
  created: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  category: { tag: string; label: string };
}

export class AdzunaConnector implements DataConnector<AdzunaJob> {
  readonly name = 'adzuna';
  readonly sourceType: DataSourceType = 'job_api';
  readonly displayName = 'Adzuna Job Postings';

  private _isEnabled: boolean;
  private appId: string;
  private appKey: string;
  private baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  private country: string;

  constructor() {
    this.appId = process.env.ADZUNA_APP_ID || '';
    this.appKey = process.env.ADZUNA_APP_KEY || '';
    this.country = process.env.ADZUNA_COUNTRY || 'in';
    this._isEnabled = process.env.ADZUNA_ENABLED === 'true' && !!this.appId && !!this.appKey;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  async checkHealth(): Promise<ConnectorHealth> {
    if (!this.appId || !this.appKey) {
      return {
        status: 'unavailable',
        lastChecked: new Date(),
        message: 'ADZUNA_APP_ID and ADZUNA_APP_KEY are required. Register at https://developer.adzuna.com/',
      };
    }

    try {
      // Test API with a minimal request
      const url = `${this.baseUrl}/${this.country}/search/1?app_id=${this.appId}&app_key=${this.appKey}&results_per_page=1`;
      const response = await fetch(url);
      if (response.ok) {
        return { status: 'healthy', lastChecked: new Date() };
      }
      return {
        status: 'degraded',
        lastChecked: new Date(),
        message: `API returned ${response.status}`,
      };
    } catch (error) {
      return {
        status: 'unavailable',
        lastChecked: new Date(),
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async fetchRaw(_params: FetchParams): Promise<RawDataBatch<AdzunaJob>> {
    // Implementation will use the Adzuna search endpoint
    // with pagination, keyword, and location filters
    throw new Error('Not yet implemented — requires API credentials (Phase 2)');
  }

  async normalize(raw: RawDataBatch<AdzunaJob>): Promise<NormalizedRecord[]> {
    return raw.records.map((job) => ({
      type: 'job_posting' as const,
      data: this.normalizeJob(job),
    }));
  }

  private normalizeJob(job: AdzunaJob): NormalizedJobPosting {
    return {
      externalId: job.id,
      title: job.title,
      employer: job.company?.display_name,
      description: job.description,
      locationRaw: job.location?.display_name,
      // State/district extraction will require location normalization
      postingDate: job.created ? new Date(job.created) : undefined,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryCurrency: 'INR',
      salaryPeriod: 'annual',
      sector: job.category?.label,
      sourceUrl: job.redirect_url,
      source: 'adzuna',
    };
  }

  async ingest(_params: FetchParams): Promise<IngestionResult> {
    throw new Error('Not yet implemented — requires API credentials (Phase 2)');
  }
}
