# Intelligence Engine Methodology

**Version:** 1.0  
**Date:** 2026-10-04

This document describes the methodology for each intelligence engine in the platform.
All formulas are transparent and configurable. No black-box AI decisions.

---

## 1. Demand Index

### Purpose
Quantify the relative demand for a skill or occupation in a specific geography and time period.

### Input Signals

| Signal | Description | Default Weight | Source |
|--------|-------------|----------------|--------|
| `posting_volume` | Count of active job postings | 0.25 | Job APIs |
| `posting_growth` | Month-over-month growth rate | 0.20 | Job APIs (time series) |
| `employer_count` | Unique employers posting | 0.15 | Job APIs |
| `skill_frequency` | How often this skill appears in postings | 0.15 | Extracted skills |
| `geographic_concentration` | Spatial density of demand | 0.10 | Job posting locations |
| `salary_signal` | Relative salary level (higher = more demand) | 0.10 | Job salary data |
| `leading_indicators` | EPFO/Udyam/GeM signals | 0.05 | When available |

### Calculation

1. **Normalize** each signal to [0, 1] using min-max normalization within the context (e.g., across all skills in the same geography and period).
2. **Compute** weighted sum:
   ```
   DemandIndex = Σ(weight_i × normalized_signal_i)
   ```
3. **Result** is a value in [0, 1] where:
   - 0.0–0.2 = Very Low demand
   - 0.2–0.4 = Low demand
   - 0.4–0.6 = Moderate demand
   - 0.6–0.8 = High demand
   - 0.8–1.0 = Very High demand

### Transparency
- All weights are stored in configuration and can be adjusted.
- The signal breakdown is persisted with every DemandSignal record.
- A user can see: "Demand Index = 0.73 because posting volume (0.82 × 0.25) + growth (0.65 × 0.20) + ..."

### Where AI Is Used
- **Before** demand calculation: NLP extracts skills from job descriptions.
- **Not** in the index formula itself.

---

## 2. Effective Supply Index

### Purpose
Estimate the actual available skilled workforce, not just raw training numbers.

### Formula

```
EffectiveSupply = GrossTrainedSupply
                  × EmploymentConversionRate
                  × SkillRelevanceFactor
                  × RetentionFactor
```

### Components

| Component | Description | Data Source | Default |
|-----------|-------------|-----------|---------|
| `GrossTrainedSupply` | Total trained/certified persons | Training programme data | Observed |
| `EmploymentConversionRate` | % who actually get employed | PLFS, training outcomes | Estimated 0.4 |
| `SkillRelevanceFactor` | How relevant the training is to market demand | NOS/NSQF alignment | Estimated 0.8 |
| `RetentionFactor` | % still employed after 6 months | Follow-up data | Estimated 0.7 |

### Important Notes
- With current data (PLFS only), we can provide PLFS-derived macro context (e.g., 4.2% have vocational training) but NOT occupation-level supply counts.
- Every factor carries a `dataOrigin` tag: OBSERVED, ESTIMATED, or MODELED.
- The system clearly labels which numbers are real and which are estimated.

---

## 3. Skill Gap Score

### Formula

```
GapScore = DemandIndex − EffectiveSupplyIndex
```

### Classification Thresholds (Configurable)

| Gap Score Range | Classification | Colour |
|----------------|---------------|--------|
| > +0.6 | Critical Shortage | Red |
| +0.3 to +0.6 | Shortage | Orange |
| −0.3 to +0.3 | Balanced | Green |
| −0.6 to −0.3 | Oversupply | Blue |
| < −0.6 | Critical Oversupply | Purple |

### Evidence Array
Every gap classification includes an evidence array:

```json
{
  "severity": "CRITICAL_SHORTAGE",
  "evidence": [
    "Demand increased 35% MoM (127 → 172 postings)",
    "12 unique employers posting in this period",
    "Effective supply estimated at 0.18 (low training volume)",
    "Forecast indicates continued shortage through Q2 2027"
  ]
}
```

---

## 4. Forecasting

### Methods
- **Exponential Smoothing** (default) — good for short-term, limited data points
- **Linear Trend Projection** — when there's a clear directional trend
- **ARIMA** — when sufficient historical data is available (12+ data points)

### Minimum Data Requirements
| Horizon | Minimum Data Points |
|---------|-------------------|
| 3 months | 6 monthly observations |
| 6 months | 9 monthly observations |
| 12 months | 12 monthly observations |

If insufficient data is available, the system returns:
```json
{
  "status": "insufficient_data",
  "message": "Insufficient historical data to generate a reliable 12-month forecast. Only 4 data points available; 12 required.",
  "dataPointCount": 4,
  "requiredDataPoints": 12
}
```

### Confidence
- Every forecast includes a confidence score (0–1) and a confidence interval.
- Forecasts are never presented as certainty.
- UI labels clearly distinguish "Forecast" from "Observed" data.

---

## 5. Early Warning Rules

| Alert Type | Trigger Logic | Minimum Evidence |
|------------|--------------|-----------------|
| **Emerging Skill** | New skill appears in >20 postings from >5 employers in <30 days | Posting data |
| **Shortage Escalation** | Gap score crosses from SHORTAGE to CRITICAL_SHORTAGE | Demand + Supply data |
| **Saturation Risk** | Supply growth > demand growth for 2+ consecutive periods | Time-series data |
| **Declining Demand** | Posting volume drops >25% MoM for 2+ consecutive months | Posting data |

All thresholds are configurable.

---

## 6. Skill Adjacency / Transition Score

### Formula

```
TransitionScore = CompetencyOverlap × 0.4
                + NSQFProximity × 0.2
                + DemandAtTarget × 0.2
                + BridgeCourseAvailability × 0.1
                + GeographicDemand × 0.1
```

### Components

| Component | Range | How Computed |
|-----------|-------|-------------|
| CompetencyOverlap | 0–1 | NOS/NSQF competency comparison |
| NSQFProximity | 0–1 | 1.0 for same level, decays with distance |
| DemandAtTarget | 0–1 | Current demand index for target skill |
| BridgeCourseAvailability | 0 or 1 | Whether a bridging course exists |
| GeographicDemand | 0–1 | Local demand in the worker's geography |

### Safety Guards
- Minimum competency overlap of 0.3 required for any recommendation.
- NSQF level gap of >3 levels invalidates a direct transition.
- Never recommend transitions solely based on name similarity.

---

## 7. Training Optimizer

### Objective Function
Maximize total gap coverage:
```
maximize Σ(gap_severity_i × seats_allocated_i)
```

### Constraints
- `total_budget ≤ available_budget`
- `seats_per_course ≤ centre_capacity`
- `seats_per_course ≥ minimum_viable_batch` (typically 15)
- `priority_district_allocation ≥ floor_percent` (equity constraint)

### Output
For each skill/district combination:
- Current seats
- Recommended seats (increase / decrease / maintain)
- Budget impact
- Rationale (human-readable explanation)
- Priority rank

---

## 8. Data Labelling Standards

| Label | Definition |
|-------|-----------|
| **Live** | Data fetched within the last 24 hours from a real-time source |
| **Periodically Updated** | Data from scheduled ingestion (daily/weekly/monthly) |
| **Historical** | Archival data from a past period |
| **Observed** | Direct measurement from an authoritative source |
| **Estimated** | Inferred or modeled from proxy data |
| **Forecast** | Projected future value with confidence interval |
| **Synthetic** | Development/testing data — never shown in production |
