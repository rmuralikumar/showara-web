import fs from "fs";
import https from "https";

const env = fs.readFileSync(".env.local", "utf8");
let apiKey = "";
let token = "";
for (const line of env.split("\n")) {
  if (line.startsWith("TMDB_API_KEY=")) apiKey = line.split("=")[1].replace(/["']/g, "").trim();
  if (line.startsWith("TMDB_READ_ACCESS_TOKEN=")) token = line.split("=")[1].replace(/["']/g, "").trim();
}

function get(path) {
  return new Promise((resolve) => {
    https.get("https://api.themoviedb.org/3" + path, {
      headers: { Authorization: "Bearer " + token, "User-Agent": "Showara/1.0" }
    }, (res) => {
      let b = "";
      res.on("data", (d) => b += d);
      res.on("end", () => resolve(JSON.parse(b)));
    }).on("error", (e) => resolve({ error: e.message }));
  });
}

async function test() {
  const titles = [
    { title: "Vishwanath & Sons", id: 1408162 },
    { title: "Dune: Part Two", id: 693134 },
    { title: "Deadpool & Wolverine", id: 533535 },
    { title: "Oppenheimer", id: 872585 },
    { title: "Interstellar", id: 157336 },
    { title: "Kalki 2898 AD", id: 801688 },
    { title: "Stree 2", id: 1047041 },
    { title: "RRR", id: 579974 },
    { title: "Kantara", id: 1024546 },
    { title: "K.G.F: Chapter 2", id: 585245 }
  ];

  for (const t of titles) {
    const res = await get(`/movie/${t.id}?append_to_response=videos`);
    const ytVideos = (res.videos?.results || []).filter(v => v.site === "YouTube");
    const officialTrailer = ytVideos.find(v => v.type === "Trailer" && v.official);
    const anyTrailer = ytVideos.find(v => v.type === "Trailer");
    const officialTeaser = ytVideos.find(v => v.type === "Teaser" && v.official);
    const anyTeaser = ytVideos.find(v => v.type === "Teaser");
    const best = officialTrailer || anyTrailer || officialTeaser || anyTeaser || ytVideos[0];
    console.log(`[${t.title}] (${t.id}): total videos=${ytVideos.length}, best key=${best?.key}, name="${best?.name}", type=${best?.type}, official=${best?.official}`);
  }
}

test();
