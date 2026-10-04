import fs from 'fs';
import path from 'path';

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle CSV line parsing with quotes
    const values = [];
    let insideQuote = false;
    let currentVal = '';
    
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    const obj = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || '';
      // convert numbers if numeric
      if (!isNaN(val) && val !== '') {
        val = Number(val);
      }
      obj[h] = val;
    });
    results.push(obj);
  }
  return results;
}

const files = [
  { csv: 'state_profiles.csv', json: 'stateProfiles.json' },
  { csv: 'state_labour_market_rollup.csv', json: 'stateLabourMarketRollup.json' },
  { csv: 'state_sector_occupation_demand.csv', json: 'stateSectorOccupationDemand.json' },
  { csv: 'state_skill_supply.csv', json: 'stateSkillSupply.json' },
  { csv: 'state_skill_gaps.csv', json: 'stateSkillGaps.json' },
  { csv: 'synthetic_job_evidence.csv', json: 'syntheticJobEvidence.json' }
];

const targetDir = 'd:/sih/apps/web/src/data';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

files.forEach(f => {
  const csvPath = path.join('d:/sih', f.csv);
  if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const parsed = parseCSV(content);
    fs.writeFileSync(path.join(targetDir, f.json), JSON.stringify(parsed, null, 2));
    console.log(`Converted ${f.csv} (${parsed.length} rows) -> ${f.json}`);
  } else {
    console.warn(`CSV file not found: ${csvPath}`);
  }
});
