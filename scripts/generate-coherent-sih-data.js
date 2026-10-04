/**
 * Coherent Regional Labour Market Dataset Generator for SIH 2026 (PS 26246)
 * 
 * Generates realistic, internally consistent synthetic datasets matching:
 * 1. Regional economic specialization of Indian districts
 * 2. Realistic synthetic employer names (e.g. "Godavari Engineering Works", "Nashik Precision Components")
 * 3. Measurable, occupation-relevant technical skills (CNC, PLC, EV, CAD, Python, etc.)
 * 4. Deterministic mathematical demand calculation:
 *    - Posting volume
 *    - Employer count
 *    - Growth rate
 *    - Effective supply (Training seats * completion * placement)
 *    - Gap calculation = Demand Volume - Effective Supply
 * 5. Traceable data lineage (Postings -> Skills -> Occupations -> Training Supply -> Gap)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SYNTHETIC_DIR = path.resolve(ROOT_DIR, 'data/synthetic');
const WEB_DATA_DIR = path.resolve(ROOT_DIR, 'apps/web/src/data');

if (!fs.existsSync(SYNTHETIC_DIR)) fs.mkdirSync(SYNTHETIC_DIR, { recursive: true });
if (!fs.existsSync(WEB_DATA_DIR)) fs.mkdirSync(WEB_DATA_DIR, { recursive: true });

// 1. Regional Cluster Profiles
const REGIONAL_CLUSTERS = [
  {
    state: 'Maharashtra',
    district: 'Nashik',
    focusSectors: ['Automotive Components', 'Precision Engineering', 'Agro-Processing', 'Electrical Equipment'],
    employers: [
      'Nashik Precision Components Ltd',
      'Godavari Engineering Works',
      'Western Auto Systems',
      'Maharashtra Agro Processing Consortium',
      'Trimbak Tooling Solutions',
      'Deccan Industrial Technologies',
      'Satpur Electrical Assemblies',
      'Ambad Machine Tools Corp'
    ],
    skillProfile: [
      { skill: 'CNC Programming', category: 'Manufacturing', demandVolume: 240, employers: 18, growth: 22, nco: '7223.0100', occ: 'CNC Machine Setter & Operator', nsqf: 5, seats: 120, compRate: 0.85, placeRate: 0.78 },
      { skill: 'CNC Operation', category: 'Manufacturing', demandVolume: 380, employers: 24, growth: 19, nco: '7223.0200', occ: 'CNC Machine Operator', nsqf: 4, seats: 180, compRate: 0.88, placeRate: 0.82 },
      { skill: 'AutoCAD Mechanical', category: 'Engineering Design', demandVolume: 160, employers: 14, growth: 12, nco: '3118.0100', occ: 'Mechanical Draughtsperson', nsqf: 4, seats: 140, compRate: 0.90, placeRate: 0.72 },
      { skill: 'Auto Electrical', category: 'Automotive', demandVolume: 210, employers: 16, growth: 26, nco: '7412.0100', occ: 'Automotive Electrician', nsqf: 4, seats: 110, compRate: 0.84, placeRate: 0.76 },
      { skill: 'Industrial Automation', category: 'Automation', demandVolume: 140, employers: 12, growth: 34, nco: '3115.0100', occ: 'Automation Technician', nsqf: 5, seats: 50, compRate: 0.82, placeRate: 0.88 },
      { skill: 'Food Processing Machinery', category: 'Agro-Processing', demandVolume: 120, employers: 9, growth: 15, nco: '8160.0100', occ: 'Food Plant Operator', nsqf: 4, seats: 90, compRate: 0.80, placeRate: 0.70 },
      { skill: 'Welding & Fabrication', category: 'Manufacturing', demandVolume: 290, employers: 20, growth: 8, nco: '7212.0100', occ: 'Welder (Gas & Electric)', nsqf: 3, seats: 260, compRate: 0.86, placeRate: 0.80 }
    ]
  },
  {
    state: 'Maharashtra',
    district: 'Pune',
    focusSectors: ['Automotive & EV Mobility', 'Software & IT Services', 'Electronics & Hardware', 'Industrial Automation'],
    employers: [
      'Pune Digital Systems Ltd',
      'Western Mobility Technologies',
      'Deccan Automation Labs',
      'Sahyadri Embedded Solutions',
      'MahaAuto Engineering Works',
      'Hinjawadi Tech Solutions',
      'Chakan Precision Forgings'
    ],
    skillProfile: [
      { skill: 'EV Systems & Powertrain', category: 'Automotive', demandVolume: 420, employers: 28, growth: 42, nco: '3115.0400', occ: 'EV Powertrain Technician', nsqf: 5, seats: 140, compRate: 0.86, placeRate: 0.88 },
      { skill: 'Battery Management Systems', category: 'Automotive', demandVolume: 280, employers: 21, growth: 48, nco: '3114.0300', occ: 'Battery Systems Specialist', nsqf: 6, seats: 60, compRate: 0.90, placeRate: 0.92 },
      { skill: 'PLC & SCADA Programming', category: 'Automation', demandVolume: 310, employers: 22, growth: 28, nco: '3115.0100', occ: 'Industrial Controller Programmer', nsqf: 5, seats: 160, compRate: 0.84, placeRate: 0.85 },
      { skill: 'Python', category: 'Software & IT', demandVolume: 560, employers: 45, growth: 31, nco: '2512.0100', occ: 'Software Engineer', nsqf: 6, seats: 480, compRate: 0.92, placeRate: 0.86 },
      { skill: 'React & TypeScript', category: 'Software & IT', demandVolume: 490, employers: 38, growth: 25, nco: '2512.0200', occ: 'Full Stack Web Developer', nsqf: 6, seats: 420, compRate: 0.90, placeRate: 0.84 }
    ]
  },
  {
    state: 'Maharashtra',
    district: 'Mumbai',
    focusSectors: ['Financial Services', 'Supply Chain & Logistics', 'IT & Business Services', 'Port Infrastructure'],
    employers: [
      'Mumbai Financial Tech Systems',
      'Konkan Maritime Logistics',
      'Western Business Solutions',
      'Bombay Digital Analytics',
      'Gateway Supply Chain Services'
    ],
    skillProfile: [
      { skill: 'SQL & Database Administration', category: 'Software & IT', demandVolume: 620, employers: 52, growth: 20, nco: '2521.0100', occ: 'Database Administrator', nsqf: 6, seats: 540, compRate: 0.94, placeRate: 0.88 },
      { skill: 'GST & Corporate Accounting', category: 'Finance', demandVolume: 480, employers: 42, growth: 14, nco: '3313.0100', occ: 'Accounting Technician', nsqf: 5, seats: 460, compRate: 0.88, placeRate: 0.82 },
      { skill: 'Supply Chain Analytics', category: 'Logistics', demandVolume: 340, employers: 29, growth: 32, nco: '3331.0100', occ: 'Logistics Operations Officer', nsqf: 5, seats: 210, compRate: 0.86, placeRate: 0.84 }
    ]
  },
  {
    state: 'Karnataka',
    district: 'Bengaluru',
    focusSectors: ['Software & Cloud Computing', 'Semiconductor & Embedded Electronics', 'Aerospace Components', 'Data & AI'],
    employers: [
      'Kaveri Cloud Networks',
      'Bengaluru Silicon Technologies',
      'Deccan Data Systems',
      'Electronic City Systems',
      'Whitefield Embedded Labs'
    ],
    skillProfile: [
      { skill: 'Cloud DevOps & Kubernetes', category: 'Software & IT', demandVolume: 840, employers: 68, growth: 52, nco: '2522.0100', occ: 'Cloud Infrastructure Engineer', nsqf: 6, seats: 360, compRate: 0.92, placeRate: 0.90 },
      { skill: 'Python', category: 'Software & IT', demandVolume: 920, employers: 74, growth: 38, nco: '2512.0100', occ: 'Software Engineer', nsqf: 6, seats: 680, compRate: 0.94, placeRate: 0.91 },
      { skill: 'Embedded Firmware (C/C++)', category: 'Electronics', demandVolume: 410, employers: 34, growth: 29, nco: '2152.0100', occ: 'Embedded Systems Developer', nsqf: 6, seats: 220, compRate: 0.88, placeRate: 0.86 },
      { skill: 'VLSI & Circuit Verification', category: 'Electronics', demandVolume: 290, employers: 22, growth: 36, nco: '2152.0200', occ: 'Semiconductor Design Specialist', nsqf: 7, seats: 120, compRate: 0.90, placeRate: 0.94 }
    ]
  },
  {
    state: 'Tamil Nadu',
    district: 'Chennai',
    focusSectors: ['Automotive & Heavy Engineering', 'Electronics Manufacturing (EMS)', 'Port Logistics', 'IT Services'],
    employers: [
      'Coromandel Auto Components',
      'Chennai Electronics Hub Ltd',
      'Tamil Nadu Precision Machining',
      'Sriperumbudur Assembly Systems',
      'Ennore Marine Logistics'
    ],
    skillProfile: [
      { skill: 'SMT Electronic Assembly', category: 'Electronics', demandVolume: 480, employers: 32, growth: 38, nco: '8212.0100', occ: 'Electronic Equipment Assembler', nsqf: 4, seats: 180, compRate: 0.86, placeRate: 0.82 },
      { skill: 'Automotive CAD', category: 'Engineering Design', demandVolume: 340, employers: 26, growth: 18, nco: '3118.0100', occ: 'Automotive Design Draughtsperson', nsqf: 5, seats: 240, compRate: 0.88, placeRate: 0.80 },
      { skill: 'Vehicle Diagnostics', category: 'Automotive', demandVolume: 290, employers: 24, growth: 24, nco: '7231.0100', occ: 'Motor Vehicle Mechanic', nsqf: 4, seats: 190, compRate: 0.84, placeRate: 0.78 }
    ]
  },
  {
    state: 'Gujarat',
    district: 'Surat',
    focusSectors: ['Textile Machinery & Automation', 'Chemical Process Technology', 'Diamond Processing Technology', 'Industrial Engineering'],
    employers: [
      'Sabarmati Chemical Processors',
      'Surat Automated Looms Ltd',
      'Tapi Industrial Works',
      'Gujarat Precision Forgings'
    ],
    skillProfile: [
      { skill: 'Automated Loom Maintenance', category: 'Manufacturing', demandVolume: 320, employers: 28, growth: 24, nco: '7233.0200', occ: 'Textile Machinery Mechanic', nsqf: 4, seats: 160, compRate: 0.82, placeRate: 0.80 },
      { skill: 'Chemical Plant Operation', category: 'Process', demandVolume: 280, employers: 22, growth: 16, nco: '8131.0100', occ: 'Chemical Plant Operator', nsqf: 4, seats: 190, compRate: 0.86, placeRate: 0.84 },
      { skill: 'Industrial Automation', category: 'Automation', demandVolume: 210, employers: 18, growth: 28, nco: '3115.0100', occ: 'Automation Technician', nsqf: 5, seats: 110, compRate: 0.85, placeRate: 0.86 }
    ]
  },
  {
    state: 'Haryana',
    district: 'Gurugram',
    focusSectors: ['Automotive Components', 'Software & Digital Products', 'Renewable Energy Automation', 'Electronics'],
    employers: [
      'North Auto Systems Ltd',
      'Gurugram Component Works',
      'Haryana Green Energy Labs',
      'Manesar Precision Engineering'
    ],
    skillProfile: [
      { skill: 'Solar PV Microgrid SCADA', category: 'Renewables', demandVolume: 260, employers: 20, growth: 44, nco: '3131.0200', occ: 'Solar Power Plant Technician', nsqf: 5, seats: 80, compRate: 0.88, placeRate: 0.85 },
      { skill: 'Automotive CAD', category: 'Engineering Design', demandVolume: 390, employers: 30, growth: 22, nco: '3118.0100', occ: 'Mechanical Draughtsperson', nsqf: 5, seats: 210, compRate: 0.86, placeRate: 0.80 },
      { skill: 'Quality Control & Inspection', category: 'Manufacturing', demandVolume: 340, employers: 28, growth: 14, nco: '7543.0100', occ: 'Quality Inspector', nsqf: 4, seats: 290, compRate: 0.90, placeRate: 0.82 }
    ]
  },
  {
    state: 'Madhya Pradesh',
    district: 'Indore',
    focusSectors: ['Pharmaceutical Formulations', 'Automotive & Precision Castings', 'Food Processing Technology', 'Industrial Engineering'],
    employers: [
      'Malwa Pharma Laboratories',
      'Pithampur Precision Engineering',
      'Central India Agro Technologies',
      'Indore Machine Works'
    ],
    skillProfile: [
      { skill: 'Pharmaceutical Cleanroom Formulation', category: 'Pharma', demandVolume: 340, employers: 26, growth: 36, nco: '8131.0200', occ: 'Pharmaceutical Formulation Operator', nsqf: 5, seats: 110, compRate: 0.86, placeRate: 0.88 },
      { skill: 'CNC Operation', category: 'Manufacturing', demandVolume: 290, employers: 22, growth: 18, nco: '7223.0200', occ: 'CNC Machine Operator', nsqf: 4, seats: 190, compRate: 0.84, placeRate: 0.80 },
      { skill: 'Quality Control & Inspection', category: 'Manufacturing', demandVolume: 240, employers: 20, growth: 12, nco: '7543.0100', occ: 'Quality Inspector', nsqf: 4, seats: 210, compRate: 0.88, placeRate: 0.78 }
    ]
  },
  {
    state: 'Telangana',
    district: 'Hyderabad',
    focusSectors: ['Biotechnology & Pharmaceuticals', 'Software & Data Engineering', 'Aerospace Precision', 'Electronics'],
    employers: [
      'Telangana Pharma Formulations',
      'Hyderabad Biocare Systems',
      'Deccan Cyber Systems',
      'Genome Valley Labs'
    ],
    skillProfile: [
      { skill: 'Bioprocess & Cleanroom Operations', category: 'Pharma', demandVolume: 410, employers: 32, growth: 34, nco: '8131.0200', occ: 'Biotech Plant Operator', nsqf: 5, seats: 180, compRate: 0.88, placeRate: 0.86 },
      { skill: 'Python', category: 'Software & IT', demandVolume: 780, employers: 62, growth: 30, nco: '2512.0100', occ: 'Software Engineer', nsqf: 6, seats: 580, compRate: 0.92, placeRate: 0.88 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    focusSectors: ['Port Logistics & Cargo Tech', 'Marine Engineering', 'Steel & Heavy Metallurgy', 'Chemicals'],
    employers: [
      'Visakha Port Logistics',
      'Eastern Heavy Marine Works',
      'Coastal Steel & Fabrication',
      'Andhra Process Equipment'
    ],
    skillProfile: [
      { skill: 'Port Logistics & Cargo Handling', category: 'Logistics', demandVolume: 320, employers: 24, growth: 26, nco: '3331.0200', occ: 'Port Operations Specialist', nsqf: 5, seats: 140, compRate: 0.85, placeRate: 0.82 },
      { skill: 'Welding & Heavy Fabrication', category: 'Manufacturing', demandVolume: 360, employers: 28, growth: 15, nco: '7212.0100', occ: 'Structural Welder', nsqf: 4, seats: 280, compRate: 0.88, placeRate: 0.80 }
    ]
  },
  {
    state: 'Uttar Pradesh',
    district: 'Kanpur',
    focusSectors: ['Leather & Footwear Technology', 'Light Engineering', 'Digital Office Services', 'Textiles'],
    employers: [
      'Ganga Industrial Solutions',
      'Kanpur Engineering Works',
      'Awadh Processing Systems'
    ],
    skillProfile: [
      { skill: 'Industrial Electrical & Wiring', category: 'Electrical', demandVolume: 280, employers: 22, growth: 16, nco: '7411.0100', occ: 'Building & Industrial Electrician', nsqf: 4, seats: 240, compRate: 0.84, placeRate: 0.76 },
      { skill: 'Basic Data Entry & Office Tools', category: 'Administration', demandVolume: 160, employers: 14, growth: -12, nco: '4132.0100', occ: 'Data Entry Operator', nsqf: 3, seats: 450, compRate: 0.90, placeRate: 0.35 }
    ]
  },
  {
    state: 'West Bengal',
    district: 'Kolkata',
    focusSectors: ['Supply Chain & Logistics', 'Foundry & Heavy Engineering', 'IT & Business Operations', 'Textiles'],
    employers: [
      'Howrah Heavy Engineering Works',
      'Bengal Industrial Supply Corp',
      'Kolkata Freight Logistics'
    ],
    skillProfile: [
      { skill: 'Foundry & Metal Casting', category: 'Manufacturing', demandVolume: 280, employers: 24, growth: 12, nco: '7211.0100', occ: 'Foundry Patternmaker', nsqf: 4, seats: 220, compRate: 0.84, placeRate: 0.78 },
      { skill: 'Supply Chain Operations', category: 'Logistics', demandVolume: 360, employers: 30, growth: 22, nco: '3331.0100', occ: 'Logistics Assistant', nsqf: 4, seats: 240, compRate: 0.86, placeRate: 0.80 }
    ]
  }
];

console.log('Generating coherent regional labour market dataset...');

// 2. Generate Demand Signals & Supply Signals with exact formulas
const demandSignals = [];
const supplySignals = [];
const trainingCentres = [];
const trainingPrograms = [];
const jobPostings = [];
const allSkillsMap = new Map();

let centreCounter = 1;
let programCounter = 1;
let jobCounter = 1;

REGIONAL_CLUSTERS.forEach(cluster => {
  // Create 1-2 training centres per district
  const centre1Id = `CTR${String(centreCounter++).padStart(4, '0')}`;
  const centre1Name = `${cluster.district} Government ITI & Skill Development Centre`;
  trainingCentres.push({
    centreId: centre1Id,
    centreName: centre1Name,
    state: cluster.state,
    district: cluster.district,
    centreType: 'Government ITI',
    annualCapacity: 600,
    utilizationRate: 0.82,
    placementRate: 0.78,
    source: 'SIH Development Dataset',
    dataOrigin: 'SYNTHETIC'
  });

  const centre2Id = `CTR${String(centreCounter++).padStart(4, '0')}`;
  const centre2Name = `${cluster.district} Industrial Training Hub (PPP)`;
  trainingCentres.push({
    centreId: centre2Id,
    centreName: centre2Name,
    state: cluster.state,
    district: cluster.district,
    centreType: 'PPP / Industry-Partnered',
    annualCapacity: 450,
    utilizationRate: 0.78,
    placementRate: 0.82,
    source: 'SIH Development Dataset',
    dataOrigin: 'SYNTHETIC'
  });

  cluster.skillProfile.forEach((item, sIdx) => {
    // Unique skill catalog
    if (!allSkillsMap.has(item.skill)) {
      allSkillsMap.set(item.skill, {
        skill_id: `SKL${String(allSkillsMap.size + 1).padStart(4, '0')}`,
        skill_name: item.skill,
        skill_category: item.category,
        skill_description: `Technical competency in ${item.skill} for ${item.category} applications.`,
        source: 'SIH Development Dataset',
        data_origin: 'SYNTHETIC'
      });
    }

    // Effective Supply Calculation: seats * completionRate * placementRate
    const effectiveSupply = Math.round(item.seats * item.compRate * item.placeRate);
    const gap = item.demandVolume - effectiveSupply;

    let severity = 'Balanced';
    let demandLevel = 'Moderate';
    if (item.demandVolume >= 400 || (gap > 150 && item.growth > 20)) {
      severity = 'Critical';
      demandLevel = 'High';
    } else if (gap > 60 || item.growth > 15) {
      severity = 'Shortage';
      demandLevel = 'High';
    } else if (gap < -100 || item.growth < 0) {
      severity = 'Oversupply';
      demandLevel = 'Low';
    }

    // Normalized Demand Score (0 to 100) combining volume, employers, and growth
    const volumeScore = Math.min(100, (item.demandVolume / 800) * 100);
    const employerScore = Math.min(100, (item.employers / 60) * 100);
    const growthScore = Math.max(0, Math.min(100, 50 + item.growth * 1.5));
    const demandIndex = Math.round((volumeScore * 0.40 + employerScore * 0.30 + growthScore * 0.30) * 10) / 10;

    demandSignals.push({
      state: cluster.state,
      district: cluster.district,
      skill: item.skill,
      jobPostings: item.demandVolume,
      employerCount: item.employers,
      growthMoM: item.growth,
      demandLevel,
      demandIndex,
      severitySeed: severity,
      source: 'SIH Development Dataset',
      dataOrigin: 'SYNTHETIC'
    });

    supplySignals.push({
      state: cluster.state,
      district: cluster.district,
      skill: item.skill,
      trainingSeats: item.seats,
      completionRate: item.compRate,
      placementRate: item.placeRate,
      effectiveSupplyIndex: effectiveSupply,
      gap,
      severity,
      source: 'SIH Development Dataset',
      dataOrigin: 'SYNTHETIC'
    });

    // Training program record
    const targetCentre = sIdx % 2 === 0 ? centre1Id : centre2Id;
    const targetCentreName = sIdx % 2 === 0 ? centre1Name : centre2Name;
    trainingPrograms.push({
      programId: `TRN${String(programCounter++).padStart(5, '0')}`,
      centreId: targetCentre,
      centreName: targetCentreName,
      courseName: `${item.skill} Certification & Trade Practicum`,
      skillId: allSkillsMap.get(item.skill).skill_id,
      skillName: item.skill,
      state: cluster.state,
      district: cluster.district,
      nsqfLevel: item.nsqf,
      durationWeeks: item.nsqf >= 5 ? 16 : 12,
      annualSeats: item.seats,
      completionRate: item.compRate,
      placementRate: item.placeRate,
      annualBudgetInr: item.seats * 25000,
      source: 'SIH Development Dataset',
      dataOrigin: 'SYNTHETIC'
    });

    // Generate coherent job postings for this skill & district
    const employerName = cluster.employers[sIdx % cluster.employers.length];
    const sectorName = cluster.focusSectors[sIdx % cluster.focusSectors.length];
    
    for (let j = 0; j < Math.min(6, Math.ceil(item.demandVolume / 40)); j++) {
      jobPostings.push({
        jobId: `SYNJOB${String(jobCounter++).padStart(6, '0')}`,
        jobTitle: `${item.skill} Specialist / Technician`,
        company: employerName,
        state: cluster.state,
        district: cluster.district,
        description: `Hiring qualified ${item.occ} with hands-on proficiency in ${item.skill}. Role supports active production line at our ${cluster.district} facility. Candidate must have completed accredited vocational or engineering certificate.`,
        skills: [item.skill, 'Quality Control & Inspection', 'Safety Compliance'],
        experienceYears: item.nsqf >= 5 ? 2 : 1,
        salaryMin: 22000 + (item.nsqf * 4000),
        salaryMax: 35000 + (item.nsqf * 6000),
        postedDate: '2026-06-15',
        employmentType: 'Full-time Regular',
        sector: sectorName,
        ncoCode: item.nco,
        source: 'SIH Development Dataset',
        dataOrigin: 'SYNTHETIC'
      });
    }
  });
});

// Save to web data folder
fs.writeFileSync(path.join(WEB_DATA_DIR, 'demandSignals.json'), JSON.stringify(demandSignals, null, 2));
fs.writeFileSync(path.join(WEB_DATA_DIR, 'supplySignals.json'), JSON.stringify(supplySignals, null, 2));
fs.writeFileSync(path.join(WEB_DATA_DIR, 'trainingCentres.json'), JSON.stringify(trainingCentres, null, 2));
fs.writeFileSync(path.join(WEB_DATA_DIR, 'trainingPrograms.json'), JSON.stringify(trainingPrograms, null, 2));
fs.writeFileSync(path.join(WEB_DATA_DIR, 'sampleJobPostings.json'), JSON.stringify(jobPostings, null, 2));
fs.writeFileSync(path.join(WEB_DATA_DIR, 'skills.json'), JSON.stringify(Array.from(allSkillsMap.values()), null, 2));

console.log(`Generated coherent datasets:`);
console.log(`- ${demandSignals.length} demand signals across ${REGIONAL_CLUSTERS.length} districts`);
console.log(`- ${supplySignals.length} supply signals with exact effective supply & gap metrics`);
console.log(`- ${trainingCentres.length} training centres`);
console.log(`- ${trainingPrograms.length} training programs`);
console.log(`- ${jobPostings.length} realistic regional job postings (employers: Godavari Engineering, Nashik Precision, etc.)`);
console.log(`- ${allSkillsMap.size} technical/occupational skills`);
