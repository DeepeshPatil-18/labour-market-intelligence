# Synthetic Labour Intelligence Data — SIH Prototype

These files are synthetic development/demo data. They are NOT official Government statistics and must never be presented as real labour-market measurements.

Real reference datasets already held separately:
- NCO 2015 occupations
- PLFS 2025 labour indicators

Synthetic datasets created here:
- synthetic_skills.csv — canonical demo skill taxonomy
- synthetic_occupation_skills.csv — demo NCO-to-skill relationships
- synthetic_job_postings.csv — raw job-posting-like records
- synthetic_training_centres.csv — demo training-centre capacity/outcomes
- synthetic_training_programs.csv — demo training supply
- synthetic_demand_signals.csv — precomputed demo demand signals for initial UI
- synthetic_supply_signals.csv — precomputed demo supply signals for initial UI

Recommended later transition:
SyntheticJobProvider -> Adzuna/Jooble/NCS connectors.
Synthetic demand/supply signals -> backend intelligence engine.

All synthetic records carry data_origin=SYNTHETIC.
