async function testOverpass() {
  // Query cinemas in Bengaluru bounding box to test Overpass API responsiveness
  // Bengaluru bbox: 12.80,77.45,13.15,77.75
  const query = `[out:json][timeout:25];
(
  node["amenity"="cinema"](12.80,77.45,13.15,77.75);
  way["amenity"="cinema"](12.80,77.45,13.15,77.75);
);
out center tags 20;`;

  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  console.log("Connecting to Overpass API for sample OSM cinema data...");
  const res = await fetch(url, { headers: { "User-Agent": "ShowaraCinemaResearch/1.0" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  console.log("Found real OSM cinema elements in bbox:", data.elements.length);
  if (data.elements.length > 0) {
    const sample = data.elements.find(e => e.tags && e.tags.name) || data.elements[0];
    console.log("Sample real cinema from OSM:", JSON.stringify({
      id: sample.id,
      name: sample.tags.name || sample.tags["name:en"],
      brand: sample.tags.brand || sample.tags.operator,
      lat: sample.lat || sample.center?.lat,
      lon: sample.lon || sample.center?.lon,
      tags: sample.tags
    }, null, 2));
  }
}

testOverpass().catch(err => console.error("Overpass error:", err.message));
