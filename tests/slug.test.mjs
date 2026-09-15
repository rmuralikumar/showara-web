import test from "node:test";
import assert from "node:assert/strict";

function slugify(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function simpleSlugify(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchesSlug(candidate, targetSlug) {
  if (!candidate || !targetSlug) return false;
  const c = candidate.trim().toLowerCase();
  const t = targetSlug.trim().toLowerCase();
  if (c === t) return true;
  const s1 = slugify(c);
  const s2 = slugify(t);
  if (s1 && s2 && s1 === s2) return true;
  const sim1 = simpleSlugify(c);
  const sim2 = simpleSlugify(t);
  if (sim1 && sim2 && sim1 === sim2) return true;
  if (s1 && s2 && s1.replace(/-and-/g, "-") === s2.replace(/-and-/g, "-")) return true;
  return false;
}

test("slugify handles colons, apostrophes, ampersands, unicode, and numbers", () => {
  assert.equal(slugify("The End of Oak Street"), "the-end-of-oak-street");
  assert.equal(slugify("Dune: Part Two"), "dune-part-two");
  assert.equal(slugify("Deadpool & Wolverine"), "deadpool-and-wolverine");
  assert.equal(slugify("Kalki 2898 AD"), "kalki-2898-ad");
  assert.equal(slugify("K.G.F: Chapter 2"), "k-g-f-chapter-2");
  assert.equal(slugify("Amélie"), "amelie");
});

test("matchesSlug handles variations flexibly", () => {
  assert.equal(matchesSlug("The End of Oak Street", "the-end-of-oak-street"), true);
  assert.equal(matchesSlug("deadpool-wolverine", "deadpool-and-wolverine"), true);
  assert.equal(matchesSlug("Dune: Part Two", "dune-part-two"), true);
  assert.equal(matchesSlug("kalki-2898-ad", "kalki-2898-ad"), true);
});
