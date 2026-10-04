/**
 * PLFS Labour Indicator Loader
 *
 * Reads the PLFS 2025 CSV and imports macro labour-market
 * indicators into the LabourIndicator table.
 *
 * IMPORTANT: PLFS provides national/rural/urban aggregates only.
 * It does NOT provide state/district or occupation/skill-level data.
 * This connector is a supply-context signal, not a granular supply source.
 */

import type {
  DataConnector,
  DataSourceType,
  FetchParams,
  RawDataBatch,
  NormalizedRecord,
  NormalizedLabourIndicator,
  ConnectorHealth,
  IngestionResult,
} from '../../types';

/** Raw row shape from the PLFS CSV */
interface RawPLFSRow {
  indicator: string;
  year: string;
  geography: string;
  age_group: string;
  sex: string;
  category: string;
  unit: string;
  value: string;
  source_page: string;
}

export class PLFSLoader implements DataConnector<RawPLFSRow> {
  readonly name = 'plfs_2025';
  readonly sourceType: DataSourceType = 'labour_survey';
  readonly displayName = 'PLFS 2025 Labour Indicators';

  private _isEnabled = true;
  private csvPath: string;

  constructor(csvPath: string) {
    this.csvPath = csvPath;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  async checkHealth(): Promise<ConnectorHealth> {
    try {
      const fs = await import('fs/promises');
      await fs.access(this.csvPath);
      return {
        status: 'healthy',
        lastChecked: new Date(),
        message: `CSV file accessible at ${this.csvPath}`,
      };
    } catch {
      return {
        status: 'unavailable',
        lastChecked: new Date(),
        message: `CSV file not found at ${this.csvPath}`,
      };
    }
  }

  async fetchRaw(_params: FetchParams): Promise<RawDataBatch<RawPLFSRow>> {
    throw new Error('Not yet implemented — will be implemented in Phase 1');
  }

  async normalize(raw: RawDataBatch<RawPLFSRow>): Promise<NormalizedRecord[]> {
    return raw.records
      .filter((row) => row.indicator?.trim() && row.value?.trim())
      .map((row) => ({
        type: 'labour_indicator' as const,
        data: this.normalizeRow(row),
      }));
  }

  private normalizeRow(row: RawPLFSRow): NormalizedLabourIndicator {
    return {
      indicator: row.indicator.trim(),
      year: parseInt(row.year.trim(), 10),
      geographyRaw: row.geography.trim(),
      ageGroup: row.age_group?.trim() || undefined,
      sex: row.sex?.trim() || undefined,
      category: row.category?.trim() || undefined,
      unit: row.unit.trim(),
      value: parseFloat(row.value.trim()),
      dataOrigin: 'OBSERVED',
      source: 'PLFS Annual Report 2024-25',
      sourcePage: row.source_page?.trim() || undefined,
    };
  }

  async ingest(_params: FetchParams): Promise<IngestionResult> {
    throw new Error('Not yet implemented — will be implemented in Phase 1');
  }
}
