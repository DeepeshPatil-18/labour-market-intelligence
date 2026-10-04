/**
 * Pre-processes CSV files into optimized JSON structures for the frontend data layer.
 * Keeps data provenance intact and structures data for fast client-side querying.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT_DIR, 'apps/web/src/data');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Simple CSV parser supporting quotes
function parseCSV(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length === 0) return [];
  
  // Clean BOM if present
  let headerLine = lines[0];
  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.slice(1);
  }

  const parseRow = (line) => {
    const row = [];
    let insideQuotes = false;
    let field = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (c === ',' && !insideQuotes) {
        row.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    row.push(field.trim());
    return row;
  };

  const headers = parseRow(headerLine).map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseRow(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    records.push(obj);
  }

  return records;
}

console.log('Processing datasets for frontend data services...');

// 1. PLFS 2025 Indicators
const plfsRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/raw/plfs_2025_labour_indicators.csv'), 'utf8');
const plfsRecords = parseCSV(plfsRaw);
fs.writeFileSync(path.join(OUT_DIR, 'plfsIndicators.json'), JSON.stringify(plfsRecords, null, 2));
console.log(`Saved ${plfsRecords.length} PLFS indicator records.`);

// 2. Skills
const skillsRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_skills.csv'), 'utf8');
const skillsRecords = parseCSV(skillsRaw);
fs.writeFileSync(path.join(OUT_DIR, 'skills.json'), JSON.stringify(skillsRecords, null, 2));
console.log(`Saved ${skillsRecords.length} skills.`);

// 3. Demand Signals
const demandRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_demand_signals.csv'), 'utf8');
const demandRecords = parseCSV(demandRaw).map(d => ({
  state: d.state,
  district: d.district,
  skill: d.skill,
  jobPostings: parseInt(d.job_postings, 10) || 0,
  employerCount: parseInt(d.employer_count, 10) || 0,
  demandIndex: parseFloat(d.demand_index) || 0,
  severitySeed: d.severity_seed,
  source: d.source,
  dataOrigin: d.data_origin
}));
fs.writeFileSync(path.join(OUT_DIR, 'demandSignals.json'), JSON.stringify(demandRecords, null, 2));
console.log(`Saved ${demandRecords.length} demand signals.`);

// 4. Supply Signals
const supplyRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_supply_signals.csv'), 'utf8');
const supplyRecords = parseCSV(supplyRaw).map(s => ({
  state: s.state,
  district: s.district,
  skill: s.skill,
  trainingSeats: parseInt(s.training_seats, 10) || 0,
  completionRate: parseFloat(s.completion_rate) || 0,
  placementRate: parseFloat(s.placement_rate) || 0,
  effectiveSupplyIndex: parseFloat(s.effective_supply_index) || 0,
  source: s.source,
  dataOrigin: s.data_origin
}));
fs.writeFileSync(path.join(OUT_DIR, 'supplySignals.json'), JSON.stringify(supplyRecords, null, 2));
console.log(`Saved ${supplyRecords.length} supply signals.`);

// 5. Training Centres
const centresRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_training_centres.csv'), 'utf8');
const centresRecords = parseCSV(centresRaw).map(c => ({
  centreId: c.centre_id,
  centreName: c.centre_name,
  state: c.state,
  district: c.district,
  centreType: c.centre_type,
  annualCapacity: parseInt(c.annual_capacity, 10) || 0,
  utilizationRate: parseFloat(c.utilization_rate) || 0,
  placementRate: parseFloat(c.placement_rate) || 0,
  source: c.source,
  dataOrigin: c.data_origin
}));
fs.writeFileSync(path.join(OUT_DIR, 'trainingCentres.json'), JSON.stringify(centresRecords, null, 2));
console.log(`Saved ${centresRecords.length} training centres.`);

// 6. Training Programs
const programsRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_training_programs.csv'), 'utf8');
const programsRecords = parseCSV(programsRaw).map(p => ({
  programId: p.program_id,
  centreId: p.centre_id,
  courseName: p.course_name,
  skillId: p.skill_id,
  skillName: p.skill_name,
  state: p.state,
  district: p.district,
  nsqfLevel: parseInt(p.nsqf_level, 10) || 4,
  durationWeeks: parseInt(p.duration_weeks, 10) || 12,
  annualSeats: parseInt(p.annual_seats, 10) || 0,
  completionRate: parseFloat(p.completion_rate) || 0,
  placementRate: parseFloat(p.placement_rate) || 0,
  annualBudgetInr: parseInt(p.annual_budget_inr, 10) || 0,
  source: p.source,
  dataOrigin: p.data_origin
}));
fs.writeFileSync(path.join(OUT_DIR, 'trainingPrograms.json'), JSON.stringify(programsRecords, null, 2));
console.log(`Saved ${programsRecords.length} training programs.`);

// 7. Job Postings (Representative sample of 2,500 diverse postings for fast browser search)
const jobsRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_job_postings.csv'), 'utf8');
const allJobs = parseCSV(jobsRaw);
const sampleJobs = allJobs.slice(0, 2500).map(j => ({
  jobId: j.job_id,
  jobTitle: j.job_title,
  company: j.company,
  state: j.state,
  district: j.district,
  description: j.description,
  skills: (j.skills_raw || '').split(';').map(s => s.trim()).filter(Boolean),
  experienceYears: parseInt(j.experience_years, 10) || 0,
  salaryMin: parseInt(j.salary_min, 10) || 0,
  salaryMax: parseInt(j.salary_max, 10) || 0,
  postedDate: j.posted_date,
  employmentType: j.employment_type,
  sector: j.sector,
  ncoCode: j.nco_code,
  source: j.source,
  dataOrigin: j.data_origin
}));
fs.writeFileSync(path.join(OUT_DIR, 'sampleJobPostings.json'), JSON.stringify(sampleJobs, null, 2));
console.log(`Saved ${sampleJobs.length} job postings (out of ${allJobs.length}).`);

// 8. Occupation Skills Mapping (Sample top mappings)
const occSkillsRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/synthetic/synthetic_occupation_skills.csv'), 'utf8');
const occSkills = parseCSV(occSkillsRaw).map(o => ({
  ncoCode: o.nco_code,
  skillId: o.skill_id,
  skillName: o.skill_name,
  relationship: o.relationship,
  proficiencyLevel: parseInt(o.proficiency_level, 10) || 2,
  source: o.source,
  dataOrigin: o.data_origin
}));
fs.writeFileSync(path.join(OUT_DIR, 'occupationSkills.json'), JSON.stringify(occSkills.slice(0, 3000), null, 2));
console.log(`Saved ${Math.min(occSkills.length, 3000)} occupation-skill mappings.`);

// 9. NCO 2015 Occupations (Optimized canonical index)
const ncoRaw = fs.readFileSync(path.join(ROOT_DIR, 'data/raw/nco_2015_occupations.csv'), 'utf8');
const ncoRecords = parseCSV(ncoRaw).map(r => ({
  ncoCode: r.nco_code || '',
  title: r.occupation_title || '',
  description: r.occupation_description || '',
  divisionCode: r.division_code || '',
  divisionTitle: r.division_title || '',
  subDivisionCode: r.sub_division_code || '',
  subDivisionTitle: r.sub_division_title || '',
  groupCode: r.group_code || '',
  groupTitle: r.group_title || '',
  familyCode: r.family_code || '',
  familyTitle: r.family_title || '',
  isco08Code: r.isco_08_unit_group_code || '',
  qpNosReference: r.qp_nos_reference || '',
  qpNosName: r.qp_nos_name || '',
  nsqfLevel: r.nsqf_level ? parseInt(r.nsqf_level, 10) : null,
  nco2004Code: r.nco_2004_code || '',
  source: 'NCO 2015 (DGET, MoLE)',
  dataOrigin: 'OBSERVED_REFERENCE'
}));
fs.writeFileSync(path.join(OUT_DIR, 'ncoOccupations.json'), JSON.stringify(ncoRecords, null, 2));
console.log(`Saved ${ncoRecords.length} NCO 2015 canonical occupations.`);

// 10. Geography Tree (Extract states & districts from demand/supply/training)
const geoMap = {};
demandRecords.forEach(d => {
  if (!geoMap[d.state]) geoMap[d.state] = new Set();
  geoMap[d.state].add(d.district);
});
const geography = Object.keys(geoMap).sort().map(state => ({
  state,
  districts: Array.from(geoMap[state]).sort()
}));
fs.writeFileSync(path.join(OUT_DIR, 'geography.json'), JSON.stringify(geography, null, 2));
console.log(`Saved geography hierarchy (${geography.length} states, ${geography.reduce((acc, s) => acc + s.districts.length, 0)} districts).`);

console.log('Finished preparing frontend datasets successfully.');
