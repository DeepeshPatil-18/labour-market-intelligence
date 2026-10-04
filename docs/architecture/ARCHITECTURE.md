# Labour Market Intelligence Platform — Architecture Document

**Project:** AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine  
**Problem Statement:** SIH 2026 — PS 26246  
**Version:** 1.0  
**Date:** 2026-10-04

---

## 1. System Overview

A government decision-support platform that transforms raw labour-market data into actionable intelligence for MSDE officials, state/district skill planners, and training capacity planners. A secondary public layer provides skill discovery and learning roadmap guidance for citizens.

### Core Intelligence Pipeline

```
External Data Sources
        ↓
Connectors / Ingestion Layer
        ↓
Raw Data Store (data/raw)
        ↓
Normalization Layer (scripts/normalize)
        ↓
Canonical Database (PostgreSQL via Prisma)
        ↓
Intelligence Engines (packages/intelligence)
        ├── Demand Engine
        ├── Effective Supply Engine
        ├── Skill Gap Engine
        ├── Forecast Engine
        ├── Early Warning Engine
        ├── Skill Adjacency Engine
        └── Training Optimizer
        ↓
Backend REST API (apps/api)
        ↓
Frontend (apps/web)
        ├── Government Dashboard
        └── Public Skill Finder
```

---

## 2. Data Layer Architecture

### 2.1 Five-Layer Separation

| Layer | Location | Purpose |
|-------|----------|---------|
| **Raw Source** | `data/raw/` | Unmodified CSV, JSON, API snapshots. Never overwritten. |
| **Reference** | `data/reference/` | Curated lookup tables (NCO hierarchy, geography codes, NSQF levels). |
| **Processed** | `data/processed/` | Cleaned, validated, import-ready files. |
| **Canonical DB** | PostgreSQL | Normalized relational storage — single source of truth. |
| **Intelligence/Derived** | PostgreSQL (derived tables) | Computed indices, forecasts, alerts, gaps. |

### 2.2 Current Datasets

#### NCO 2015 Occupations (`nco_2015_occupations.csv`)

| Property | Value |
|----------|-------|
| Records | 3,448 occupations |
| Encoding | UTF-8 with BOM |
| Hierarchy levels | Division (9) → Sub-division (40) → Group (122) → Family (373) → Occupation (3,448) |
| QP/NOS mapped | 878 occupations (25.5%) |
| NSQF levels present | 823 occupations (23.9%), levels 1–8 |
| ISCO-08 mapped | All records have ISCO-08 unit group codes |
| NCO-2004 crosswalk | 2,673 records (77.5%) |
| Sector Skill Councils | 23 unique SSC prefixes |

**Fields:**
- `nco_code` — 8-digit hierarchical code (e.g. `1111.0100`)
- `occupation_title` — Canonical title
- `occupation_description` — Detailed description (3,328/3,448 populated)
- `division_code`, `division_title` — 1-digit, top level
- `sub_division_code`, `sub_division_title` — 2-digit
- `group_code`, `group_title` — 3-digit
- `family_code`, `family_title` — 4-digit
- `isco_08_unit_group_code`, `isco_08_unit_group_title` — ISCO-08 mapping
- `qp_nos_reference` — Qualification Pack code (e.g. `ASC/Q6305`)
- `qp_nos_name` — QP human-readable name
- `nsqf_level` — National Skills Qualification Framework level (1–8)
- `nco_2004_code` — Legacy code crosswalk
- `source_volume`, `source_page` — Source PDF reference

**Data Quality Notes:**
- 4 records missing `occupation_title`
- 120 records missing `occupation_description`
- 52 records missing `sub_division_title`
- 29 records missing `family_title` (some contain hierarchy descriptions embedded in the field)
- 134 records missing `isco_08_unit_group_title`

#### PLFS 2025 Labour Indicators (`plfs_2025_labour_indicators.csv`)

| Property | Value |
|----------|-------|
| Records | 126 indicator observations |
| Encoding | UTF-8 |
| Time span | 2022–2025 |
| Geographic granularity | All India, Rural, Urban (no state/district) |
| Indicators | 12 distinct types |

**Fields:**
- `indicator` — Type (LFPR, WPR, UR, Youth UR, NEET, earnings, etc.)
- `year` — 2022–2025
- `geography` — All India / Rural / Urban
- `age_group` — 15+, 15-24, 15-29, 15-59, 25+
- `sex` — Male / Female / Person
- `category` — Context category (employment status, industry, etc.)
- `unit` — percent / INR/month / INR/day / crore persons / years
- `value` — Numeric value
- `source_page` — Reference page number

**12 Indicators:**
| Indicator | Rows | Description |
|-----------|------|-------------|
| LFPR | 27 | Labour Force Participation Rate |
| WPR | 27 | Worker Population Ratio |
| UR | 9 | Unemployment Rate |
| Youth UR | 6 | Youth Unemployment Rate (15-29) |
| NEET | 2 | Not in Employment, Education, Training |
| Industry employment share | 16 | Sectoral employment distribution |
| Employment status share | 12 | Self-employed / Regular wage / Casual |
| Average earnings | 12 | Wages by employment type |
| Average years of formal education | 8 | Education attainment |
| Estimated employed persons | 3 | Total employment count |
| Formal vocational/technical training | 2 | Training participation rate |
| Workforce participation among formally trained | 2 | Training-to-employment conversion |

**Critical Limitation:** PLFS provides national/rural/urban aggregates only. It does NOT provide state-level or district-level breakdowns, nor occupation-level or skill-level supply data. It must be treated as a macro supply-context signal, not as granular skill-supply data.

---

## 3. Database Schema

See `packages/database/schema.prisma` for the full Prisma schema.

### Entity Relationship Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Geography   │────▶│   DemandSignal   │◀────│   Occupation    │
│  (country/   │     │                  │     │  (NCO 2015)     │
│   state/     │     └──────────────────┘     │                 │
│   district)  │                              │  ┌────────────┐ │
│              │     ┌──────────────────┐     │  │ QP/NOS ref │ │
│              │────▶│   SupplySignal   │◀────│  └────────────┘ │
│              │     └──────────────────┘     └────────┬────────┘
│              │                                       │
│              │     ┌──────────────────┐     ┌────────▼────────┐
│              │────▶│    SkillGap      │◀────│     Skill       │
│              │     └──────────────────┘     │  (canonical)    │
│              │                              └────────┬────────┘
│              │     ┌──────────────────┐              │
│              │────▶│    Forecast      │◀─────────────┘
│              │     └──────────────────┘
│              │
│              │     ┌──────────────────┐     ┌─────────────────┐
│              │────▶│   JobPosting     │────▶│   DataSource    │
│              │     └──────────────────┘     └─────────────────┘
│              │
│              │     ┌──────────────────┐
│              │────▶│ TrainingCentre   │
│              │     │  └─ programs     │
│              │     └──────────────────┘
│              │
│              │     ┌──────────────────┐
│              │────▶│TrainingAllocation│
│              │     └──────────────────┘
│              │
│              │     ┌──────────────────┐
│              │────▶│ LabourIndicator  │
│              │     └──────────────────┘
│              │
│              │     ┌──────────────────┐
│              │────▶│     Alert        │
│              │     └──────────────────┘
└─────────────┘
```

### Key Design Decisions

1. **Geography is a tree** — `country → state → district` via self-referential `parentId`.
2. **Occupation uses NCO 2015** as the canonical classification. Hierarchy stored via `divisionCode`, `subDivisionCode`, `groupCode`, `familyCode`.
3. **Skills are first-class entities** with many-to-many relationships to occupations and job postings.
4. **Data provenance** — `DataSource` tracks every external source with freshness metadata.
5. **Observed vs Estimated vs Forecast** — every derived value carries a `dataOrigin` enum.
6. **Confidence levels** — all computed results carry a confidence score and methodology reference.

---

## 4. Connector Architecture

### 4.1 Interface Design

Every connector implements a common interface:

```typescript
interface DataConnector<T> {
  readonly name: string;
  readonly sourceType: DataSourceType;
  readonly isEnabled: boolean;
  
  // Health check
  checkHealth(): Promise<ConnectorHealth>;
  
  // Fetch raw data
  fetchRaw(params: FetchParams): Promise<RawDataBatch<T>>;
  
  // Normalize to canonical schema
  normalize(raw: RawDataBatch<T>): Promise<NormalizedRecord[]>;
  
  // Full ingest pipeline
  ingest(params: FetchParams): Promise<IngestionResult>;
}

interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  lastChecked: Date;
  message?: string;
  latencyMs?: number;
}

interface IngestionResult {
  source: string;
  recordsFetched: number;
  recordsNormalized: number;
  recordsInserted: number;
  recordsSkipped: number;
  errors: IngestionError[];
  duration: number;
  timestamp: Date;
}
```

### 4.2 Planned Connectors

| Connector | Type | Status | Priority |
|-----------|------|--------|----------|
| `NCOImporter` | Reference/File | **Ready** — CSV available | P0 |
| `PLFSLoader` | Reference/File | **Ready** — CSV available | P0 |
| `AdzunaConnector` | Demand/API | Needs API key | P1 |
| `JoobleConnector` | Demand/API | Needs API key | P1 |
| `NCSConnector` | Demand/API | Needs authorization | P2 |
| `EShramConnector` | Supply/API | Needs official dataset/API | P2 |
| `EPFOConnector` | Leading Indicator | Needs access | P3 |
| `UdyamConnector` | Leading Indicator | Needs access | P3 |
| `GeMConnector` | Leading Indicator | Needs access | P3 |
| `DataMeetLoader` | Geography/File | GeoJSON available | P1 |
| `SyntheticProvider` | Dev/Testing | For development only | P0 |

### 4.3 Isolation & Fault Tolerance

- Each connector runs independently.
- A connector failure logs an error but does not crash the ingestion pipeline.
- Connectors can be enabled/disabled via environment config.
- A registry pattern manages connector lifecycle.

```typescript
class ConnectorRegistry {
  private connectors: Map<string, DataConnector<unknown>>;
  
  register(connector: DataConnector<unknown>): void;
  enable(name: string): void;
  disable(name: string): void;
  getEnabled(): DataConnector<unknown>[];
  runAll(params: FetchParams): Promise<IngestionSummary>;
  runOne(name: string, params: FetchParams): Promise<IngestionResult>;
}
```

---

## 5. Intelligence Engine Architecture

### 5.1 Demand Engine

**Input signals** (weighted, configurable):

| Signal | Weight (default) | Source |
|--------|------------------|--------|
| Active posting volume | 0.25 | Job postings |
| Posting growth rate (MoM) | 0.20 | Job postings (time series) |
| Employer count (unique) | 0.15 | Job postings |
| Skill frequency | 0.15 | Extracted skills from postings |
| Geographic concentration | 0.10 | Posting locations |
| Salary signal | 0.10 | Salary data when available |
| Leading indicators | 0.05 | EPFO/Udyam/GeM when available |

**Demand Index formula:**

```
DemandIndex(skill, geo, period) = Σ(wi × normalized_signal_i)
```

All weights are configurable. Each signal is min-max normalized within its context before aggregation.

### 5.2 Effective Supply Engine

```
Gross trained/certified
    × employment_conversion_rate
    × skill_relevance_factor
    × retention_factor
    = Effective Supply Index
```

Each factor has:
- An observed value (when data exists)
- An estimated value (when inferred)
- A `dataOrigin` tag (observed / estimated / modeled)

### 5.3 Skill Gap Engine

```
GapScore = DemandIndex − EffectiveSupplyIndex
```

Classification thresholds (configurable):

| Range | Classification |
|-------|---------------|
| gap > +0.6 | Critical Shortage |
| gap > +0.3 | Shortage |
| -0.3 ≤ gap ≤ +0.3 | Balanced |
| gap < -0.3 | Oversupply |
| gap < -0.6 | Critical Oversupply |

Every classification includes an evidence array explaining contributing factors.

### 5.4 Forecast Engine

- **Methods:** Exponential smoothing, linear trend projection, ARIMA (lightweight).
- **Horizons:** 3-month, 6-month, 12-month.
- **Outputs:** demand forecast, supply forecast, projected gap.
- **Every forecast carries:** confidence interval, methodology tag, data-point count.

### 5.5 Early Warning Engine

| Alert Type | Trigger |
|------------|---------|
| Emerging Skill | New skill appears in >N postings across >M employers in <T days |
| Shortage Escalation | Gap score crosses severity threshold |
| Saturation Risk | Supply growth outpaces demand growth for >2 consecutive periods |
| Declining Demand | Posting volume drops >X% MoM for >2 months |

### 5.6 Skill Adjacency Engine

Graph-based approach:
- Nodes = Skills
- Edges = competency overlap (derived from NOS, NSQF, job co-occurrence)
- Edge weight = transition feasibility score

```
transition_score = (
    competency_overlap × 0.4
  + nsqf_proximity × 0.2
  + demand_at_target × 0.2
  + bridge_course_availability × 0.1
  + geographic_demand × 0.1
)
```

### 5.7 Training Optimizer

Constrained optimization:
- **Maximize:** gap-coverage (matching training seats to shortage areas)
- **Subject to:** budget, capacity, course availability, district priority
- **Output:** seat increase/decrease/maintain recommendations with rationale

---

## 6. AI / LLM Usage

### Appropriate AI Tasks

| Task | Method | Provider-Agnostic |
|------|--------|-------------------|
| Skill extraction from job descriptions | NER / LLM prompt | ✓ |
| Skill normalization (alias → canonical) | Embedding similarity | ✓ |
| Occupation mapping (job title → NCO) | Embedding + classification | ✓ |
| Competency overlap analysis | Semantic similarity | ✓ |
| Explanation generation | LLM prompt | ✓ |
| NSQF/NOS semantic matching | Embedding search | ✓ |

### AI Abstraction Layer

```typescript
interface AIProvider {
  readonly name: string;
  
  extractSkills(text: string): Promise<ExtractedSkill[]>;
  normalizeSkill(raw: string, candidates: string[]): Promise<NormalizedSkill>;
  mapToOccupation(title: string, description: string): Promise<OccupationMapping>;
  generateExplanation(context: ExplanationContext): Promise<string>;
  computeEmbedding(text: string): Promise<number[]>;
}
```

This abstraction allows swapping between OpenAI, Gemini, or any future provider.

---

## 7. API Architecture

### Endpoint Groups

| Group | Prefix | Purpose |
|-------|--------|---------|
| Geography | `/api/v1/geography` | States, districts, spatial data |
| Occupations | `/api/v1/occupations` | NCO hierarchy, search, details |
| Skills | `/api/v1/skills` | Skill catalog, adjacency |
| Demand | `/api/v1/demand` | Demand signals, index, trends |
| Supply | `/api/v1/supply` | Supply signals, effective supply |
| Gaps | `/api/v1/gaps` | Skill gaps, severity, evidence |
| Forecasts | `/api/v1/forecasts` | Projections by skill/geo |
| Alerts | `/api/v1/alerts` | Early warnings |
| Labour | `/api/v1/labour` | PLFS indicators, macro context |
| Training | `/api/v1/training` | Programs, centres, allocation |
| Connectors | `/api/v1/admin/connectors` | Connector status, trigger ingest |
| Auth | `/api/v1/auth` | Login, RBAC, session |

### Response Envelope

```json
{
  "data": { ... },
  "metadata": {
    "source": "PLFS Annual Report 2024-25",
    "lastUpdated": "2025-06-15",
    "dataOrigin": "observed",
    "coverage": "All India",
    "confidence": 0.85,
    "methodology": "PLFS usual status (ps+ss)"
  },
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalRecords": 142
  }
}
```

---

## 8. Frontend Architecture

### Government Dashboard Pages

| Page | Purpose | Key Components |
|------|---------|----------------|
| Overview | National snapshot | 4 KPI cards, India map, top alerts |
| Labour Market | Detailed demand/supply | Occupation heatmap, trend charts |
| Forecasts | Projections | Timeline charts, gap projections |
| Early Warnings | Alerts dashboard | Alert list with severity, evidence |
| Skill Graph | Adjacency exploration | Interactive skill graph, transitions |
| Training Optimizer | Seat allocation | District table, recommendations |

### Public Pages

| Page | Purpose |
|------|---------|
| Skill Finder | Search skills, view demand/supply status |
| My Roadmap | Personal skill gap + learning path |

### Map Implementation

- **Source:** DataMeet India GeoJSON/TopoJSON
- **Rendering:** D3.js or Leaflet with GeoJSON overlay
- **NOT:** manually drawn SVG, CSS approximations, or fabricated boundaries

---

## 9. Authentication & Security

### RBAC Roles

| Role | Access |
|------|--------|
| Admin | Full access, user management, connector config |
| State Planner | State-scoped data, forecasts, training optimization |
| District Planner | District-scoped data, local training recommendations |
| Public | Skill Finder, My Roadmap (no auth required) |

### Security Requirements

- API keys stored server-side only (`.env`)
- Environment-based configuration
- Input validation on all endpoints
- Rate limiting on public endpoints
- Server-side authorization checks
- Audit logging for government actions
- No secrets in frontend bundle
- `.env.example` committed, `.env` gitignored

---

## 10. Data Transparency Requirements

Every intelligence result must expose:

| Field | Example |
|-------|---------|
| Source | "Adzuna API, PLFS 2024-25" |
| Last Updated | "2026-10-01" |
| Geographic Coverage | "Maharashtra — all districts" |
| Data Origin | observed / estimated / forecast |
| Confidence | 0.72 |
| Methodology | "Weighted posting volume + employer count" |

Labels to use:
- **Live** — from recent API call (<24h)
- **Periodically Updated** — scheduled ingestion
- **Historical** — archival data
- **Estimated** — derived from model or proxy
- **Forecast** — projected future value

---

## 11. Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (full-stack) |
| Frontend | React / Next.js |
| Styling | Tailwind CSS |
| Charts | Recharts or similar |
| Maps | D3.js + DataMeet GeoJSON |
| Backend | Node.js + Express (or Next.js API routes) |
| ORM | Prisma |
| Database | PostgreSQL |
| AI | Provider-agnostic abstraction (OpenAI / Gemini) |
| Monorepo | Turborepo or npm workspaces |
| Icons | Phosphor Icons |
| Typography | IBM Plex Sans |
