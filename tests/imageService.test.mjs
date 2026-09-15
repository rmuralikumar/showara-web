import test from "node:test";
import assert from "node:assert/strict";

// Re-implement the pure logic for ESM runner verification or import compiled
function isValidImagePath(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return false;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower === "undefined" ||
    lower === "null" ||
    lower === "nan" ||
    lower === "none" ||
    lower === "/" ||
    lower === "//"
  ) {
    return false;
  }

  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    if (lower.includes("/undefined") || lower.includes("/null")) return false;
    return true;
  }

  if (lower.startsWith("data:image/")) return true;

  const clean = trimmed.replace(/^\/+/, "");
  const cleanLower = clean.toLowerCase();
  if (
    !clean ||
    cleanLower === "undefined" ||
    cleanLower === "null" ||
    cleanLower.startsWith("undefined") ||
    cleanLower.startsWith("null")
  ) {
    return false;
  }

  return true;
}

function normalizeTmdbPath(pathOrUrl, size = "w500") {
  if (!isValidImagePath(pathOrUrl)) return null;
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, "");
  return `https://image.tmdb.org/t/p/${size}/${clean}`;
}

test("isValidImagePath correctly rejects invalid paths", () => {
  assert.equal(isValidImagePath(null), false);
  assert.equal(isValidImagePath(undefined), false);
  assert.equal(isValidImagePath(""), false);
  assert.equal(isValidImagePath("   "), false);
  assert.equal(isValidImagePath("undefined"), false);
  assert.equal(isValidImagePath("null"), false);
  assert.equal(isValidImagePath("/undefined"), false);
  assert.equal(isValidImagePath("/null"), false);
  assert.equal(isValidImagePath("/undefined.jpg"), false);
  assert.equal(isValidImagePath("//"), false);
  assert.equal(isValidImagePath("https://image.tmdb.org/t/p/w500/undefined"), false);
});

test("isValidImagePath accepts valid paths", () => {
  assert.equal(isValidImagePath("/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"), true);
  assert.equal(isValidImagePath("1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"), true);
  assert.equal(isValidImagePath("//1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"), true);
  assert.equal(isValidImagePath("https://images.unsplash.com/photo-123"), true);
  assert.equal(isValidImagePath("data:image/svg+xml;charset=utf-8,..."), true);
});

test("normalizeTmdbPath produces correct URLs without double slashes or /undefined", () => {
  assert.equal(
    normalizeTmdbPath("/1pdfLvkb.jpg", "w500"),
    "https://image.tmdb.org/t/p/w500/1pdfLvkb.jpg"
  );
  assert.equal(
    normalizeTmdbPath("//1pdfLvkb.jpg", "w500"),
    "https://image.tmdb.org/t/p/w500/1pdfLvkb.jpg"
  );
  assert.equal(
    normalizeTmdbPath("1pdfLvkb.jpg", "w500"),
    "https://image.tmdb.org/t/p/w500/1pdfLvkb.jpg"
  );
  assert.equal(normalizeTmdbPath("undefined", "w500"), null);
  assert.equal(normalizeTmdbPath("/null", "w500"), null);
});
