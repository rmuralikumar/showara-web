import fs from "fs";

const html = fs.readFileSync("temp_homepage.html", "utf8");

// Extract all class attributes
const classRegex = /class="([^"]+)"/g;
let match;
const suspicious = new Set();
while ((match = classRegex.exec(html)) !== null) {
  const cls = match[1];
  const parts = cls.split(/\s+/);
  for (const p of parts) {
    if (
      p.startsWith("w-[") ||
      p.startsWith("min-w-[") ||
      p.startsWith("-m") ||
      p.startsWith("translate") ||
      p.includes("screen") ||
      p.startsWith("-top") ||
      p.startsWith("-bottom") ||
      p.startsWith("-left") ||
      p.startsWith("-right")
    ) {
      suspicious.add(p);
    }
  }
}

console.log("Suspicious classes found:", Array.from(suspicious));
