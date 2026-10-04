import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATE_CODE_MAP = {
  'Andaman and Nicobar': 'AN',
  'Andaman & Nicobar Island': 'AN',
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Arunanchal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chandigarh': 'CH',
  'Chhattisgarh': 'CT',
  'Dadra and Nagar Haveli': 'DN',
  'Dadara & Nagar Havelli': 'DN',
  'Daman and Diu': 'DD',
  'Daman & Diu': 'DD',
  'Delhi': 'DL',
  'NCT of Delhi': 'DL',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jammu and Kashmir': 'JK',
  'Jammu & Kashmir': 'JK',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Lakshadweep': 'LD',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Orissa': 'OD',
  'Odisha': 'OD',
  'Puducherry': 'PY',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttaranchal': 'UT',
  'Uttarakhand': 'UT',
  'West Bengal': 'WB'
};

const CANONICAL_STATE_NAMES = {
  'AN': 'Andaman and Nicobar Islands',
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CH': 'Chandigarh',
  'CT': 'Chhattisgarh',
  'DN': 'Dadra and Nagar Haveli and Daman and Diu',
  'DD': 'Dadra and Nagar Haveli and Daman and Diu',
  'DL': 'NCT of Delhi',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JK': 'Jammu and Kashmir',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'LD': 'Lakshadweep',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OD': 'Odisha',
  'PY': 'Puducherry',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TG': 'Telangana',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UT': 'Uttarakhand',
  'WB': 'West Bengal'
};

function roundCoordinates(geom, precision = 4) {
  if (!geom || !geom.coordinates) return geom;
  
  function roundArr(arr) {
    if (typeof arr[0] === 'number') {
      return [
        Math.round(arr[0] * 10000) / 10000,
        Math.round(arr[1] * 10000) / 10000
      ];
    }
    return arr.map(roundArr);
  }

  return {
    ...geom,
    coordinates: roundArr(geom.coordinates)
  };
}

async function main() {
  console.log('Downloading DataMeet India States and Districts GeoJSON...');
  const statesUrl = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';
  const districtsUrl = 'https://raw.githubusercontent.com/datameet/maps/master/docs/data/geojson/dists11.geojson';

  const [statesRes, districtsRes] = await Promise.all([
    fetch(statesUrl),
    fetch(districtsUrl)
  ]);

  if (!statesRes.ok || !districtsRes.ok) {
    throw new Error(`Failed to download spatial data: States ${statesRes.status}, Districts ${districtsRes.status}`);
  }

  const statesGeoJSON = await statesRes.json();
  const districtsGeoJSON = await districtsRes.json();

  console.log(`Processing ${statesGeoJSON.features.length} state features and ${districtsGeoJSON.features.length} district features...`);

  // Enrich States with normalized codes and names and round coordinates
  statesGeoJSON.features = statesGeoJSON.features.map(f => {
    const rawName = f.properties.NAME_1 || f.properties.st_nm || f.properties.NAME;
    const code = STATE_CODE_MAP[rawName] || 'IN';
    const canonicalName = CANONICAL_STATE_NAMES[code] || rawName;

    return {
      type: 'Feature',
      geometry: roundCoordinates(f.geometry, 4),
      properties: {
        state_code: code,
        state_name: canonicalName,
        raw_name: rawName,
        data_source: 'DataMeet India Maps (Creative Commons Attribution 2.5 India)'
      }
    };
  });

  // Enrich Districts with normalized codes and state associations
  districtsGeoJSON.features = districtsGeoJSON.features.map(f => {
    const rawState = f.properties.ST_NM || f.properties.NAME_1 || '';
    const stateCode = STATE_CODE_MAP[rawState] || 'UNKNOWN';
    const canonicalState = CANONICAL_STATE_NAMES[stateCode] || rawState;
    const rawDistrict = f.properties.DISTRICT || f.properties.NAME_2 || f.properties.dt_name || '';

    let canonicalDistrict = rawDistrict.trim();
    if (canonicalDistrict.toLowerCase() === 'ahmadnagar') canonicalDistrict = 'Ahmednagar';
    if (canonicalDistrict.toLowerCase() === 'bid') canonicalDistrict = 'Beed';
    if (canonicalDistrict.toLowerCase() === 'gondiya') canonicalDistrict = 'Gondia';
    if (canonicalDistrict.toLowerCase() === 'garhchiroli') canonicalDistrict = 'Gadchiroli';
    if (canonicalDistrict.toLowerCase() === 'mumbai') canonicalDistrict = 'Mumbai City';

    return {
      type: 'Feature',
      geometry: roundCoordinates(f.geometry, 4),
      properties: {
        district_name: canonicalDistrict,
        raw_district_name: rawDistrict,
        state_code: stateCode,
        state_name: canonicalState,
        census_code: f.properties.censuscode || f.properties.DT_CEN_CD || null,
        data_source: 'DataMeet India Maps (Census 2011 Boundaries)'
      }
    };
  });

  // Target directories
  const webPublicDir = path.resolve(__dirname, '../apps/web/public/geography');
  const webPublicDistrictsDir = path.join(webPublicDir, 'districts');
  const dataGeoDir = path.resolve(__dirname, '../data/geography');
  const webSrcDataDir = path.resolve(__dirname, '../apps/web/src/data');

  fs.mkdirSync(webPublicDir, { recursive: true });
  fs.mkdirSync(webPublicDistrictsDir, { recursive: true });
  fs.mkdirSync(dataGeoDir, { recursive: true });
  fs.mkdirSync(webSrcDataDir, { recursive: true });

  // Save full states GeoJSON
  fs.writeFileSync(path.join(webPublicDir, 'india_states.geojson'), JSON.stringify(statesGeoJSON));
  fs.writeFileSync(path.join(dataGeoDir, 'india_states.geojson'), JSON.stringify(statesGeoJSON, null, 2));

  // Save full districts GeoJSON
  fs.writeFileSync(path.join(webPublicDir, 'india_districts.geojson'), JSON.stringify(districtsGeoJSON));
  fs.writeFileSync(path.join(dataGeoDir, 'india_districts.geojson'), JSON.stringify(districtsGeoJSON));

  // Split and save state-level district GeoJSON files for high-speed lazy-loading
  const districtsByState = {};
  for (const feature of districtsGeoJSON.features) {
    const code = feature.properties.state_code;
    if (!districtsByState[code]) {
      districtsByState[code] = {
        type: 'FeatureCollection',
        properties: {
          state_code: code,
          state_name: feature.properties.state_name,
          data_source: 'DataMeet India Maps'
        },
        features: []
      };
    }
    districtsByState[code].features.push(feature);
  }

  for (const [code, stateDistrictsCollection] of Object.entries(districtsByState)) {
    fs.writeFileSync(
      path.join(webPublicDistrictsDir, `${code}.geojson`),
      JSON.stringify(stateDistrictsCollection)
    );
  }

  // Generate Geography Crosswalk
  const crosswalk = {
    metadata: {
      source: 'DataMeet Maps + Local Government Directory (LGD) / Census 2011 Crosswalk',
      license: 'Creative Commons Attribution 2.5 India',
      repo: 'https://github.com/datameet/maps',
      generated_at: new Date().toISOString()
    },
    states: Object.entries(CANONICAL_STATE_NAMES).map(([code, name]) => ({
      state_code: code,
      state_name: name,
      district_count: districtsByState[code]?.features.length || 0
    })),
    state_code_aliases: STATE_CODE_MAP
  };

  fs.writeFileSync(path.join(webSrcDataDir, 'geographyCrosswalk.json'), JSON.stringify(crosswalk, null, 2));
  fs.writeFileSync(path.join(dataGeoDir, 'geography_crosswalk.json'), JSON.stringify(crosswalk, null, 2));

  console.log(`Optimized spatial files successfully generated.`);
}

main().catch(err => {
  console.error('Error downloading DataMeet maps:', err);
  process.exit(1);
});
