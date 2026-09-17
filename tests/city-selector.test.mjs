import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const citiesFilePath = path.join(rootDir, 'src', 'data', 'cities.ts');
const rawContent = fs.readFileSync(citiesFilePath, 'utf8');

// Strip the TypeScript import line and extract JSON/object array
const cleanedContent = rawContent
  .replace(/import\s+.*?from\s+["'].*?["'];?/g, '')
  .replace(/export\s+const\s+CITIES\s*:\s*City\[\]\s*=\s*/, 'const CITIES = ')
  .replace(/export\s+const\s+CITIES\s*=\s*/, 'const CITIES = ');

const fn = new Function(`${cleanedContent}; return CITIES;`);
const CITIES = fn();

test('1. Major cities and theatre locations across India are present in CITIES', () => {
  const expectedCities = [
    'Bengaluru',
    'Chennai',
    'Hyderabad',
    'Mumbai',
    'Delhi-NCR',
    'Pune',
    'Kolkata',
    'Kochi',
    'Ahmedabad',
    'Jaipur',
    'Chandigarh',
    'Lucknow',
    'Coimbatore',
    'Indore',
    'Bhopal',
    'Nagpur',
    'Surat',
    'Visakhapatnam',
    'Patna',
    'Vadodara',
    'Agra',
    'Varanasi',
    'Madurai',
    'Thiruvananthapuram',
    'Mysuru',
    'Mangaluru',
    'Goa (Panaji)',
    'Dehradun'
  ];

  const cityNames = CITIES.map((c) => c.name);

  for (const expected of expectedCities) {
    assert.ok(
      cityNames.includes(expected),
      `Expected city ${expected} to be in CITIES list, found: ${cityNames.join(', ')}`
    );
  }
});

test('2. Popular cities flag is correctly set on key metros', () => {
  const popularNames = [
    'Bengaluru',
    'Chennai',
    'Hyderabad',
    'Mumbai',
    'Delhi-NCR',
    'Pune',
    'Kolkata',
    'Kochi',
    'Ahmedabad',
    'Jaipur',
    'Chandigarh',
    'Lucknow'
  ];

  for (const name of popularNames) {
    const city = CITIES.find((c) => c.name === name);
    assert.ok(city, `City ${name} should exist`);
    assert.equal(city.isPopular, true, `City ${name} should have isPopular: true`);
  }
});

test('3. Search with pincode support correctly identifies cities', () => {
  const pincodeCases = [
    { pin: '560001', expectedCityId: 'bengaluru' },
    { pin: '400001', expectedCityId: 'mumbai' },
    { pin: '110001', expectedCityId: 'delhi-ncr' },
    { pin: '600001', expectedCityId: 'chennai' },
    { pin: '500081', expectedCityId: 'hyderabad' },
    { pin: '700001', expectedCityId: 'kolkata' },
    { pin: '411014', expectedCityId: 'pune' },
    { pin: '380001', expectedCityId: 'ahmedabad' },
    { pin: '682001', expectedCityId: 'kochi' },
    { pin: '302001', expectedCityId: 'jaipur' },
    { pin: '160017', expectedCityId: 'chandigarh' },
    { pin: '226010', expectedCityId: 'lucknow' }
  ];

  for (const { pin, expectedCityId } of pincodeCases) {
    const matched = CITIES.find((c) =>
      c.pincodes && c.pincodes.some((p) => p === pin || pin.startsWith(p.slice(0, 4)))
    );
    assert.ok(matched, `Expected pin ${pin} to match a city`);
    assert.equal(matched.id, expectedCityId, `Pin ${pin} should match ${expectedCityId}`);
  }
});

test('4. Alternate and historical aliases match intended cities (No valid Indian city gives No Cities Found)', () => {
  const aliasCases = [
    { alias: 'bangalore', expectedId: 'bengaluru' },
    { alias: 'bombay', expectedId: 'mumbai' },
    { alias: 'madras', expectedId: 'chennai' },
    { alias: 'calcutta', expectedId: 'kolkata' },
    { alias: 'gurgaon', expectedId: 'delhi-ncr' },
    { alias: 'noida', expectedId: 'delhi-ncr' },
    { alias: 'cochin', expectedId: 'kochi' },
    { alias: 'ernakulam', expectedId: 'kochi' },
    { alias: 'baroda', expectedId: 'vadodara' },
    { alias: 'trivandrum', expectedId: 'thiruvananthapuram' },
    { alias: 'trichy', expectedId: 'tiruchirappalli' },
    { alias: 'calicut', expectedId: 'kozhikode' },
    { alias: 'banaras', expectedId: 'varanasi' },
    { alias: 'pondy', expectedId: 'puducherry' },
    { alias: 'goa', expectedId: 'panaji' }
  ];

  for (const { alias, expectedId } of aliasCases) {
    const q = alias.toLowerCase();
    const matched = CITIES.find((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q))) return true;
      return false;
    });

    assert.ok(matched, `Alias ${alias} should resolve to a city`);
    assert.equal(matched.id, expectedId, `Alias ${alias} should resolve to ${expectedId}`);
  }
});

test('5. Theatre locations and cinema multiplex areas match cities', () => {
  const localityCases = [
    { locality: 'Koramangala', expectedId: 'bengaluru' },
    { locality: 'Whitefield', expectedId: 'bengaluru' },
    { locality: 'Bandra', expectedId: 'mumbai' },
    { locality: 'Connaught Place', expectedId: 'delhi-ncr' },
    { locality: 'Saket', expectedId: 'delhi-ncr' },
    { locality: 'Hitec City', expectedId: 'hyderabad' },
    { locality: 'Anna Nagar', expectedId: 'chennai' },
    { locality: 'Salt Lake', expectedId: 'kolkata' },
    { locality: 'Kothrud', expectedId: 'pune' },
    { locality: 'Lulu Mall Edappally', expectedId: 'kochi' }
  ];

  for (const { locality, expectedId } of localityCases) {
    const q = locality.toLowerCase();
    const matched = CITIES.find((c) =>
      c.theatreLocations && c.theatreLocations.some((l) => l.toLowerCase().includes(q))
    );
    assert.ok(matched, `Locality ${locality} should match a city`);
    assert.equal(matched.id, expectedId, `Locality ${locality} should match ${expectedId}`);
  }
});

test('6. Geolocation distance calculation finds nearest city correctly', () => {
  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function findNearest(lat, lon) {
    let nearest = CITIES[0];
    let min = Infinity;
    for (const city of CITIES) {
      if (city.latitude !== undefined && city.longitude !== undefined) {
        const d = getDistanceKm(lat, lon, city.latitude, city.longitude);
        if (d < min) {
          min = d;
          nearest = city;
        }
      }
    }
    return nearest;
  }

  // Koramangala, Bengaluru: 12.9352, 77.6119
  assert.equal(findNearest(12.9352, 77.6119).id, 'bengaluru');
  // Nariman Point, Mumbai: 18.9256, 72.8242
  assert.equal(findNearest(18.9256, 72.8242).id, 'mumbai');
  // CP, New Delhi: 28.6304, 77.2177
  assert.equal(findNearest(28.6304, 77.2177).id, 'delhi-ncr');
  // Banjara Hills, Hyderabad: 17.4156, 78.4350
  assert.equal(findNearest(17.4156, 78.4350).id, 'hyderabad');
  // Marina Beach, Chennai: 13.0500, 80.2824
  assert.equal(findNearest(13.0500, 80.2824).id, 'chennai');
  // Park Street, Kolkata: 22.5535, 88.3518
  assert.equal(findNearest(22.5535, 88.3518).id, 'kolkata');
});

test('7. CitySelectorModal component contains location picker features and responsive design', () => {
  const modalPath = path.join(rootDir, 'src', 'components', 'layout', 'CitySelectorModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  assert.ok(modalCode.includes('Use my current location'), 'Modal must have Use my current location button');
  assert.ok(modalCode.includes('navigator.geolocation'), 'Modal must use navigator.geolocation');
  assert.ok(modalCode.includes('pincode'), 'Modal must support pincode in placeholder/search');
  assert.ok(modalCode.includes('theatreLocations'), 'Modal must support theatre locations in search');
  assert.ok(modalCode.includes('popularCities'), 'Modal must display popular cities');
  assert.ok(modalCode.includes('setCity'), 'Modal must allow user to setCity');
  assert.ok(modalCode.includes('pl-safe pr-safe pt-safe pb-safe'), 'Modal backdrop must have safe-area insets');
  assert.ok(modalCode.includes('max-h-[92vh]'), 'Modal must have max-h-[92vh] for responsive viewport scaling');
});
