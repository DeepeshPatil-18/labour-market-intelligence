# India State Labour Market Mock Dataset — SIH 2026

Purpose
-------
Development-only synthetic data to populate the Labour Market Intelligence prototype for all Indian states and Union Territories.

Coverage
--------
36 geographies: 28 states + 8 Union Territories.

Design principles
-----------------
1. Each geography has a deliberately different labour-market profile.
2. Sector demand is anchored to known state economic specialisations and broad PLFS/NITI employment structure.
3. Demand is generated from sector-weighted synthetic job signals, not arbitrary 0–100 scores.
4. Skill gaps are derived from synthetic demand units versus training-capacity-adjusted effective supply.
5. Employer names are synthetic placeholders and MUST NOT be presented as real employers.
6. All rows are marked SYNTHETIC_DEVELOPMENT.
7. This dataset is not official labour-market statistics and must not be presented as observed headcount.

Files
-----
- state_profiles.csv: state/UT specialisation, labour clusters and development calibration factors.
- state_sector_occupation_demand.csv: sector + occupation demand signals.
- state_skill_supply.csv: synthetic training/supply proxy by skill.
- state_skill_gaps.csv: demand, effective supply, gap and status by skill.
- synthetic_job_evidence.csv: synthetic employer/job evidence for drill-down.
- state_labour_market_rollup.csv: map-ready state-level rollup derived from the above files.

Suggested frontend use
----------------------
Map:
  state_labour_market_rollup.csv

State drilldown:
  state_sector_occupation_demand.csv
  state_skill_gaps.csv
  synthetic_job_evidence.csv

Important
---------
PLFS and official datasets remain the source for observed macro indicators.
Use this package only to fill development coverage where granular demand/supply data are unavailable.
When live APIs become available, replace synthetic job/supply rows with observed/authorized signals while retaining the same schema.

Reference basis
---------------
State specialisations were designed using broad patterns from PLFS state/industry tables and NITI Aayog state-level employment/sector analysis, plus established state economic specialisation. The values in this package are synthetic.
