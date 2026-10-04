# Data Sources Inventory

**Last Updated:** 2026-10-04

---

## Currently Available Datasets

### 1. NCO 2015 — National Classification of Occupations

| Property | Value |
|----------|-------|
| **File** | `data/raw/nco_2015_occupations.csv` |
| **Size** | 3.4 MB |
| **Records** | 3,448 occupations |
| **Source** | Ministry of Labour & Employment, DGE&T |
| **Classification** | Hierarchical: Division → Sub-division → Group → Family → Occupation |
| **Role in system** | Canonical occupation reference layer |
| **Data quality** | High — government-published classification |
| **Freshness** | Static reference data (NCO 2015 edition) |

**What it provides:**
- Official occupation codes and titles for India
- Hierarchical occupation taxonomy (9 divisions, 40 sub-divisions, 122 groups, 373 families)
- ISCO-08 international mapping for every occupation
- Qualification Pack / NOS references for 878 occupations (25.5%)
- NSQF levels for 823 occupations (23.9%)
- Legacy NCO-2004 crosswalk for 77.5% of records
- 23 Sector Skill Council codes represented

**What it does NOT provide:**
- Current demand for these occupations
- How many workers are employed in each occupation
- Salary data per occupation
- Geographic distribution of occupations
- Skills required (must be derived from descriptions + NOS)

---

### 2. PLFS 2025 — Periodic Labour Force Survey Annual Report

| Property | Value |
|----------|-------|
| **File** | `data/raw/plfs_2025_labour_indicators.csv` |
| **Size** | 9.3 KB |
| **Records** | 126 indicator observations |
| **Source** | National Statistical Office (NSO), MoSPI |
| **Time span** | 2022–2025 |
| **Geography** | All India, Rural, Urban |
| **Role in system** | Macro labour-market context / supply signal |
| **Data quality** | High — official government survey |
| **Freshness** | Annual publication |

**What it provides:**
- Labour Force Participation Rate (LFPR) by sex, area, year
- Worker Population Ratio (WPR) trends
- Unemployment Rate (UR) — overall and youth
- NEET rate (15-24, 15-29)
- Industry-wise employment share (8 sectors)
- Employment status distribution (self-employed / regular / casual)
- Average earnings by employment type and sex
- Average years of formal education
- Vocational training participation (4.2% for 15-59)
- Training-to-employment conversion rates (83.3% male, 51.4% female)
- Total estimated employed persons (61.6 crore)

**What it does NOT provide:**
- State-level breakdowns
- District-level breakdowns
- Occupation-level employment counts
- Skill-level supply data
- Individual worker records
- Training programme details
- Job-level demand data

**Key Insight:** PLFS is a macro supply-context dataset. It tells us "40% female LFPR" and "4.2% have vocational training" but NOT "how many trained welders are in Maharashtra." For skill-level supply, we need e-Shram, PMKVY/SDI certification data, and training program data.

---

## Required Data Sources (Not Yet Available)

### Priority 1 — Labour Demand (Required for core functionality)

#### Adzuna API
| Property | Value |
|----------|-------|
| **Purpose** | Real-time job posting data for India |
| **Provides** | Job titles, descriptions, locations, salaries, skills |
| **Credential needed** | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` |
| **Registration** | https://developer.adzuna.com/ |
| **Rate limits** | Varies by plan |
| **India coverage** | Available |
| **Priority** | P1 — primary demand signal |

#### Jooble API
| Property | Value |
|----------|-------|
| **Purpose** | Aggregated job postings from multiple sources |
| **Provides** | Job titles, descriptions, locations, companies |
| **Credential needed** | `JOOBLE_API_KEY` |
| **Registration** | https://jooble.org/api/about |
| **India coverage** | Available |
| **Priority** | P1 — supplementary demand signal |

### Priority 2 — Supply & Training Data

#### e-Shram
| Property | Value |
|----------|-------|
| **Purpose** | Unorganized worker registration data |
| **Provides** | Worker counts by occupation, location, demographics |
| **Credential needed** | Official API/data-sharing agreement |
| **Status** | No public API currently available |
| **Priority** | P2 — valuable supply signal if accessible |

#### PMKVY / Skill India Training Data
| Property | Value |
|----------|-------|
| **Purpose** | Government training programme outcomes |
| **Provides** | Trained counts, certifications, placement rates by course/district |
| **Status** | Some data on Skill India portal; structured API access unclear |
| **Priority** | P2 — critical for effective supply estimation |

#### NCS (National Career Service)
| Property | Value |
|----------|-------|
| **Purpose** | Government job portal data |
| **Provides** | Job vacancies posted by registered employers |
| **Credential needed** | Authorization |
| **Status** | Public portal exists; API access unclear |
| **Priority** | P2 |

### Priority 3 — Leading Indicators

#### EPFO Data
| Property | Value |
|----------|-------|
| **Purpose** | Formal employment creation signal |
| **Provides** | Net payroll additions by sector/geography |
| **Status** | Published periodically; structured access unclear |
| **Priority** | P3 |

#### Udyam / MSME Registration
| Property | Value |
|----------|-------|
| **Purpose** | New enterprise creation signal |
| **Provides** | MSME registrations by sector, district |
| **Status** | Public portal; API access unclear |
| **Priority** | P3 |

#### GeM (Government e-Marketplace)
| Property | Value |
|----------|-------|
| **Purpose** | Government procurement activity signal |
| **Provides** | Tender/order data by category, geography |
| **Status** | Some data publicly available |
| **Priority** | P3 |

### Priority 1 — Geography

#### DataMeet India Spatial Data
| Property | Value |
|----------|-------|
| **Purpose** | India/State/District boundary GeoJSON |
| **Provides** | Accurate geographic boundaries for map rendering |
| **Source** | https://github.com/datameet/maps |
| **Format** | GeoJSON / TopoJSON |
| **License** | Open Data |
| **Priority** | P1 — required for map visualization |

---

## Data Gap Analysis

### What We CAN Build Now

| Capability | Data Source |
|------------|-----------|
| Occupation taxonomy & search | NCO 2015 ✓ |
| Macro labour market context | PLFS 2025 ✓ |
| NCO → ISCO mapping | NCO 2015 ✓ |
| QP/NOS → Occupation mapping | NCO 2015 (partial) ✓ |
| NSQF level reference | NCO 2015 (partial) ✓ |
| Database schema & import pipeline | Ready ✓ |
| Connector architecture | Ready ✓ |

### What We CANNOT Build Without Additional Data

| Capability | Missing Data |
|------------|-------------|
| Real demand index | Job posting API (Adzuna/Jooble) |
| Skill extraction from job descriptions | Job posting API + AI provider |
| District-level analysis | State/district geography + district-level data |
| Effective supply estimation | e-Shram, training programme data |
| Skill gap calculation | Both demand AND supply signals needed |
| Forecasting | Historical time-series of demand/supply (≥6 months) |
| Map visualization | DataMeet GeoJSON |
| Training optimizer | Training centre/programme data |

### Fields Not Derivable from Current Data

1. **Occupation-level employment counts** — PLFS gives sector shares, not occupation-level counts
2. **District-level indicators** — PLFS is All India / Rural / Urban only
3. **State-level LFPR/WPR/UR** — Not in current PLFS extract (available in full PLFS reports)
4. **Skill-level demand** — Requires job posting data + skill extraction
5. **Training capacity by district** — Requires training programme/centre data
6. **Placement/employment conversion rates by skill** — Requires training outcome data
7. **Salary by occupation** — Requires job posting salary data
8. **Employer demand by company** — Requires job posting data
