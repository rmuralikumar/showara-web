import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("MovieHero uses theme-independent dark gradient scrims for text legibility", () => {
  const heroPath = path.join(rootDir, "src", "components", "movies", "MovieHero.tsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Must not use var(--bg-main) in gradient overlay
  assert.equal(
    content.includes("from-[var(--bg-main)]"),
    false,
    "MovieHero should not use var(--bg-main) which creates a washed-out white overlay in light mode"
  );

  // Must use dark scrim (from-black)
  assert.ok(
    content.includes("from-black/95") && content.includes("via-black/60"),
    "MovieHero must use a guaranteed dark gradient scrim (from-black/95 via-black/60)"
  );

  // Must have horizontal dark scrim for desktop readability
  assert.ok(
    content.includes("from-black/90"),
    "MovieHero must use horizontal dark gradient scrim (from-black/90)"
  );
});

test("MovieHero badges and metadata have high-contrast backgrounds and text", () => {
  const heroPath = path.join(rootDir, "src", "components", "movies", "MovieHero.tsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Badges must use solid/semi-opaque bg-black/60 with border
  assert.ok(
    content.includes("bg-black/60 backdrop-blur-md"),
    "Badges must use semi-opaque bg-black/60 with backdrop blur"
  );

  // Formats must not use text-[var(--text-secondary)] which is unreadable in light mode
  assert.equal(
    content.includes("bg-black/50 text-[var(--text-secondary)]"),
    false,
    "Format tags must not use low-contrast text-[var(--text-secondary)] on dark badge"
  );

  // Language tag must have its own contrast-guaranteed badge
  assert.ok(
    content.includes("bg-black/60 backdrop-blur-sm") && content.includes("languages.join"),
    "Language tag must have its own solid/semi-opaque badge container"
  );

  // Secondary text must have >= 75% white opacity
  assert.ok(
    content.includes("text-white/85") || content.includes("text-white/90"),
    "Secondary text (genres, runtime, synopsis) must have at least 80-90% white opacity"
  );

  // Slide controls must have high-contrast dark buttons
  assert.ok(
    content.includes("bg-black/70 hover:bg-black/90 text-white"),
    "Slide controls must have high-contrast dark backgrounds visible in both themes"
  );
});
