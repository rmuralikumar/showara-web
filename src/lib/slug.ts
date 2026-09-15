/**
 * Centralized slug generation and matching utility for Showara.
 * Ensures consistent slug generation across cards, navigation, and detail pages.
 * Handles colons (:), apostrophes ('), ampersands (&), spaces, numbers,
 * hyphens, and Unicode accented characters.
 */

export function slugify(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  return text
    .normalize("NFD") // Decompose accented characters (e.g. é -> e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .toLowerCase()
    .trim()
    .replace(/&/g, "and") // Replace & with 'and' (Deadpool & Wolverine -> deadpool-and-wolverine)
    .replace(/['’]/g, "") // Remove apostrophes (e.g. K.G.F's -> kgfs, It's -> its)
    .replace(/[^a-z0-9]+/g, "-") // Replace any non-alphanumeric character with a hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading and trailing hyphens
}

/**
 * Alternate relaxed slugify for backward compatibility with titles that used simple regex
 * (e.g. Deadpool & Wolverine -> deadpool-wolverine where '&' was stripped)
 */
export function simpleSlugify(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Compact slug with all hyphens/separators removed for punctuation-insensitive matching
 * e.g. "K.G.F: Chapter 2" -> "kgfchapter2"
 */
export function compactSlugify(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Checks whether a candidate string (slug, title, original title, ID) matches a target slug.
 */
export function matchesSlug(
  candidate: string | null | undefined,
  targetSlug: string | null | undefined
): boolean {
  if (!candidate || !targetSlug) return false;

  const c = candidate.trim().toLowerCase();
  const t = targetSlug.trim().toLowerCase();

  // Direct exact match
  if (c === t) return true;

  const s1 = slugify(c);
  const s2 = slugify(t);
  if (s1 && s2 && s1 === s2) return true;

  const sim1 = simpleSlugify(c);
  const sim2 = simpleSlugify(t);
  if (sim1 && sim2 && sim1 === sim2) return true;

  // Normalized without -and- for '&' flexibility
  if (s1 && s2 && s1.replace(/-and-/g, "-") === s2.replace(/-and-/g, "-")) return true;

  // Compare compact alphanumeric forms (handles K.G.F vs KGF, etc.)
  const comp1 = compactSlugify(c);
  const comp2 = compactSlugify(t);
  if (comp1 && comp2 && comp1 === comp2) return true;

  // Check if one is title before subtitle colon (e.g. "Stree 2: Sarkate Ka Aatank" matches "stree-2")
  if (c.includes(":")) {
    const mainTitle = c.split(":")[0].trim();
    if (matchesSlug(mainTitle, t)) return true;
  }
  if (t.includes(":")) {
    const mainTitle = t.split(":")[0].trim();
    if (matchesSlug(c, mainTitle)) return true;
  }

  // Handle single-letter acronym hyphens e.g. "k-g-f-chapter-2" matching "kgf-chapter-2"
  const collapsed1 = s1.replace(/\b([a-z])-([a-z])\b/g, "$1$2");
  const collapsed2 = s2.replace(/\b([a-z])-([a-z])\b/g, "$1$2");
  if (collapsed1 && collapsed2 && collapsed1 === collapsed2) return true;
  if (s1 && collapsed2 && s1 === collapsed2) return true;
  if (collapsed1 && s2 && collapsed1 === s2) return true;

  return false;
}
