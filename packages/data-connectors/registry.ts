/**
 * Connector Registry
 *
 * Manages the lifecycle of all data connectors.
 * Connectors can be enabled/disabled independently.
 * One connector failing does not affect others.
 */

import type {
  DataConnector,
  FetchParams,
  IngestionResult,
  IngestionSummary,
  ConnectorHealth,
} from '../types';

export class ConnectorRegistry {
  private connectors: Map<string, DataConnector<unknown>> = new Map();

  /**
   * Register a connector. Does not enable it automatically.
   */
  register(connector: DataConnector<unknown>): void {
    if (this.connectors.has(connector.name)) {
      console.warn(
        `Connector "${connector.name}" is already registered. Overwriting.`
      );
    }
    this.connectors.set(connector.name, connector);
    console.log(
      `[ConnectorRegistry] Registered: ${connector.displayName} (${connector.sourceType})`
    );
  }

  /**
   * Get all registered connectors.
   */
  getAll(): DataConnector<unknown>[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Get only enabled connectors.
   */
  getEnabled(): DataConnector<unknown>[] {
    return this.getAll().filter((c) => c.isEnabled);
  }

  /**
   * Get a specific connector by name.
   */
  get(name: string): DataConnector<unknown> | undefined {
    return this.connectors.get(name);
  }

  /**
   * Check health of all enabled connectors.
   */
  async checkAllHealth(): Promise<Map<string, ConnectorHealth>> {
    const results = new Map<string, ConnectorHealth>();
    const enabled = this.getEnabled();

    const healthChecks = enabled.map(async (connector) => {
      try {
        const health = await connector.checkHealth();
        results.set(connector.name, health);
      } catch (error) {
        results.set(connector.name, {
          status: 'unavailable',
          lastChecked: new Date(),
          message: error instanceof Error ? error.message : 'Health check failed',
        });
      }
    });

    await Promise.allSettled(healthChecks);
    return results;
  }

  /**
   * Run ingestion for a single connector.
   * Returns null if connector not found or disabled.
   */
  async runOne(
    name: string,
    params: FetchParams
  ): Promise<IngestionResult | null> {
    const connector = this.connectors.get(name);
    if (!connector) {
      console.error(`[ConnectorRegistry] Connector "${name}" not found.`);
      return null;
    }
    if (!connector.isEnabled) {
      console.warn(`[ConnectorRegistry] Connector "${name}" is disabled. Skipping.`);
      return null;
    }

    try {
      console.log(`[ConnectorRegistry] Running ingestion: ${connector.displayName}`);
      const result = await connector.ingest(params);
      console.log(
        `[ConnectorRegistry] Completed: ${connector.displayName} — ` +
        `${result.recordsInserted} inserted, ${result.recordsSkipped} skipped, ` +
        `${result.errors.length} errors`
      );
      return result;
    } catch (error) {
      console.error(
        `[ConnectorRegistry] Fatal error in "${name}":`,
        error instanceof Error ? error.message : error
      );
      return {
        source: name,
        recordsFetched: 0,
        recordsNormalized: 0,
        recordsInserted: 0,
        recordsSkipped: 0,
        recordsFailed: 0,
        errors: [
          {
            message: error instanceof Error ? error.message : 'Unknown error',
            severity: 'error',
          },
        ],
        durationMs: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Run ingestion for ALL enabled connectors.
   * Errors in one connector do not stop others.
   */
  async runAll(params: FetchParams): Promise<IngestionSummary> {
    const startedAt = new Date();
    const enabled = this.getEnabled();
    const results: IngestionResult[] = [];

    console.log(
      `[ConnectorRegistry] Starting full ingestion. ${enabled.length} connectors enabled.`
    );

    // Run sequentially to avoid overwhelming external APIs
    for (const connector of enabled) {
      const result = await this.runOne(connector.name, params);
      if (result) {
        results.push(result);
      }
    }

    const completedAt = new Date();
    const summary: IngestionSummary = {
      startedAt,
      completedAt,
      results,
      totalRecords: results.reduce((sum, r) => sum + r.recordsInserted, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    };

    console.log(
      `[ConnectorRegistry] Ingestion complete. ` +
      `${summary.totalRecords} records, ${summary.totalErrors} errors, ` +
      `${completedAt.getTime() - startedAt.getTime()}ms`
    );

    return summary;
  }
}

/**
 * Singleton registry instance.
 */
export const connectorRegistry = new ConnectorRegistry();
