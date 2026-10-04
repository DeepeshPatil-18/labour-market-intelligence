# Labour Market Intelligence — Website Data Package

## Use this package in the website

### Frontend
- `frontend/plfs_2025_indicators.json` — compact, ready-to-load PLFS 2025 indicator data.
- `frontend/plfs_2025_indicators.csv` — same indicator table in CSV form.
- `policy/policy_signals.json` — policy-derived signals relevant to LMIS/HR planning and skill-gap features.

### Backend / analysis
- `backend/source_archives/` contains the original PLFS CSV archives supplied for 2022-23, 2023-24 and 2025.
- `backend/schema/source_registry.json` lists every supplied table, row count, column count and exact source column names.
- Do NOT treat raw PLFS sample rows as direct population counts. Use the survey design/weights and official PLFS methodology when producing estimates.
- The raw files contain coded variables. This package intentionally does not invent code labels that were not supplied in the source files.

### Policy
- `policy/national_skill_development_policy.pdf` — original 49-page policy document.
- `policy/national_skill_development_policy.txt` — text extraction for search/indexing.
- `policy/policy_signals.json` — concise machine-readable signals extracted from the policy.

## Recommended application architecture
1. Load `frontend/plfs_2025_indicators.json` for baseline national labour-market cards/charts.
2. Keep the raw PLFS archives on the backend/data-processing side, not in the browser bundle.
3. Build state/district estimates in the backend only after applying the correct PLFS survey methodology and codebook.
4. Join occupation/skill dimensions to NCO/NSQF/NOS reference data separately.
5. Combine these supply-side signals with live job-demand APIs to calculate demand, supply, skill gaps and forecasts.

## Source integrity
No synthetic labour-market values have been added to the supplied source archives. Curated indicator data is kept separate from unit-level source data.
