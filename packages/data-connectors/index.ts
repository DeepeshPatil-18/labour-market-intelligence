/**
 * Data Connectors — Package Index
 *
 * Exports all connectors and the registry.
 */

// Registry
export { ConnectorRegistry, connectorRegistry } from './registry';

// Connectors
export { NCOImporter } from './connectors/nco-importer';
export { PLFSLoader } from './connectors/plfs-loader';
export { AdzunaConnector } from './connectors/adzuna-connector';
export { JoobleConnector } from './connectors/jooble-connector';

// Future connectors (not yet implemented)
// export { NCSConnector } from './connectors/ncs-connector';
// export { EShramConnector } from './connectors/eshram-connector';
// export { EPFOConnector } from './connectors/epfo-connector';
// export { UdyamConnector } from './connectors/udyam-connector';
// export { GeMConnector } from './connectors/gem-connector';
// export { DataMeetLoader } from './connectors/datameet-loader';
// export { SyntheticProvider } from './connectors/synthetic-provider';
