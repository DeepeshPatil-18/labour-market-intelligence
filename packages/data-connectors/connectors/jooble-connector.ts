/**
 * Jooble Job Posting Connector
 *
 * Fetches aggregated job postings from the Jooble API.
 * https://jooble.org/api/about
 *
 * STATUS: Stub — requires JOOBLE_API_KEY.
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

/** Jooble API response shape */
interface JoobleJob {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company: string;
  updated: string;
  id: string;
}

export class JoobleConnector implements DataConnector<JoobleJob> {
  readonly name = 'jooble';
  readonly sourceType: DataSourceType = 'job_api';
  readonly displayName = 'Jooble Job Postings';

  private _isEnabled: boolean;
  private apiKey: string;
  private baseUrl = 'https://jooble.org/api/';

  constructor() {
    this.apiKey = process.env.JOOBLE_API_KEY || '';
    this._isEnabled = process.env.JOOBLE_ENABLED === 'true' && !!this.apiKey;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  async checkHealth(): Promise<ConnectorHealth> {
    if (!this.apiKey) {
      return {
        status: 'unavailable',
        lastChecked: new Date(),
        message: 'JOOBLE_API_KEY is required. Register at https://jooble.org/api/about',
      };
    }
    // Will test API connectivity
    return { status: 'healthy', lastChecked: new Date(), message: 'API key configured' };
  }

  async fetchRaw(_params: FetchParams): Promise<RawDataBatch<JoobleJob>> {
    throw new Error('Not yet implemented — requires API key (Phase 2)');
  }

  async normalize(raw: RawDataBatch<JoobleJob>): Promise<NormalizedRecord[]> {
    return raw.records.map((job) => ({
      type: 'job_posting' as const,
      data: this.normalizeJob(job),
    }));
  }

  private normalizeJob(job: JoobleJob): NormalizedJobPosting {
    return {
      externalId: job.id || `jooble-${Date.now()}`,
      title: job.title,
      employer: job.company,
      description: job.snippet,
      locationRaw: job.location,
      postingDate: job.updated ? new Date(job.updated) : undefined,
      sourceUrl: job.link,
      source: 'jooble',
    };
  }

  async ingest(_params: FetchParams): Promise<IngestionResult> {
    throw new Error('Not yet implemented — requires API key (Phase 2)');
  }
}
