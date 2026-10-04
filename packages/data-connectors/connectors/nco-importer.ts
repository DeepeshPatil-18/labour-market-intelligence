/**
 * NCO 2015 Importer
 *
 * Reads the NCO 2015 CSV file and imports occupation records
 * into the canonical database. This is a file-based reference
 * data connector — it reads once and populates the Occupation table.
 */

import type {
  DataConnector,
  DataSourceType,
  FetchParams,
  RawDataBatch,
  NormalizedRecord,
  NormalizedOccupation,
  ConnectorHealth,
  IngestionResult,
} from '../../types';

/** Raw row shape from the NCO 2015 CSV */
interface RawNCORow {
  nco_code: string;
  occupation_title: string;
  occupation_description: string;
  division_code: string;
  division_title: string;
  sub_division_code: string;
  sub_division_title: string;
  group_code: string;
  group_title: string;
  family_code: string;
  family_title: string;
  isco_08_unit_group_code: string;
  isco_08_unit_group_title: string;
  qp_nos_reference: string;
  qp_nos_name: string;
  nsqf_level: string;
  nco_2004_code: string;
  source_volume: string;
  source_page: string;
}

export class NCOImporter implements DataConnector<RawNCORow> {
  readonly name = 'nco_2015';
  readonly sourceType: DataSourceType = 'reference';
  readonly displayName = 'NCO 2015 Occupations';

  private _isEnabled = true;
  private csvPath: string;

  constructor(csvPath: string) {
    this.csvPath = csvPath;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  async checkHealth(): Promise<ConnectorHealth> {
    // Check if the CSV file exists and is readable
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

  async fetchRaw(_params: FetchParams): Promise<RawDataBatch<RawNCORow>> {
    // Implementation: read and parse CSV
    // Will use csv-parse or similar library
    throw new Error('Not yet implemented — will be implemented in Phase 1');
  }

  async normalize(raw: RawDataBatch<RawNCORow>): Promise<NormalizedRecord[]> {
    return raw.records.map((row) => ({
      type: 'occupation' as const,
      data: this.normalizeRow(row),
    }));
  }

  private normalizeRow(row: RawNCORow): NormalizedOccupation {
    return {
      ncoCode: row.nco_code.trim(),
      title: row.occupation_title.trim(),
      description: row.occupation_description?.trim() || undefined,
      divisionCode: row.division_code.trim(),
      divisionTitle: row.division_title.trim(),
      subDivisionCode: row.sub_division_code.trim(),
      subDivisionTitle: row.sub_division_title?.trim() || undefined,
      groupCode: row.group_code.trim(),
      groupTitle: row.group_title.trim(),
      familyCode: row.family_code.trim(),
      familyTitle: row.family_title?.trim() || undefined,
      isco08Code: row.isco_08_unit_group_code.trim(),
      isco08Title: row.isco_08_unit_group_title?.trim() || undefined,
      qpNosReference: row.qp_nos_reference?.trim() || undefined,
      qpNosName: row.qp_nos_name?.trim() || undefined,
      nsqfLevel: row.nsqf_level?.trim()
        ? parseInt(row.nsqf_level.trim(), 10)
        : undefined,
      nco2004Code: row.nco_2004_code?.trim() || undefined,
      sourceVolume: row.source_volume?.trim() || undefined,
      sourcePage: row.source_page?.trim() || undefined,
    };
  }

  async ingest(_params: FetchParams): Promise<IngestionResult> {
    // Implementation: fetchRaw → normalize → insert into database
    throw new Error('Not yet implemented — will be implemented in Phase 1');
  }
}
