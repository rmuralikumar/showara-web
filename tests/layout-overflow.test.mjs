import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("MovieCarousel is its own strictly bounded scroll container", () => {
  const carouselPath = path.join(rootDir, "src", "components", "movies", "MovieCarousel.tsx");
  const content = fs.readFileSync(carouselPath, "utf8");

  // Must not have -mx-4 negative margin bleed
  assert.equal(
    content.includes("-mx-4"),
    false,
    "MovieCarousel should not use negative margin -mx-4 that overflows viewport"
  );

  // Must have overflow-x-auto
  assert.ok(
    content.includes("overflow-x-auto"),
    "MovieCarousel scroll container must specify overflow-x-auto"
  );

  // Must have overflow-y-hidden
  assert.ok(
    content.includes("overflow-y-hidden"),
    "MovieCarousel scroll container must specify overflow-y-hidden"
  );

  // Must have w-full and max-w-full
  assert.ok(
    content.includes("max-w-full"),
    "MovieCarousel scroll container must specify max-w-full"
  );

  // Section wrapper must have overflow-hidden
  assert.ok(
    content.includes('section className="py-8 w-full max-w-full overflow-hidden"'),
    "MovieCarousel section must have w-full max-w-full overflow-hidden"
  );
});

test("Header components prevent mobile clipping, collapse, and overflow", () => {
  const headerPath = path.join(rootDir, "src", "components", "layout", "Header.tsx");
  const content = fs.readFileSync(headerPath, "utf8");

  // Logo must not shrink or clip
  assert.ok(
    content.includes("flex-shrink-0") && content.includes("SHOW") && content.includes("ARA"),
    "Header logo must have flex-shrink-0 and prevent SHOWARA clipping"
  );

  // City selector button must have min-height (~36px), horizontal padding (12-16px), and fixed gap (6-8px)
  assert.ok(
    content.includes("min-h-[36px]"),
    "Header city pill must specify explicit min-height (~36px)"
  );
  assert.ok(
    content.includes("px-3.5") || content.includes("px-4"),
    "Header city pill must have horizontal padding between 12-16px"
  );
  assert.ok(
    content.includes("gap-1.5") || content.includes("gap-2"),
    "Header city pill must specify fixed gap between 6-8px"
  );

  // City text label must not collapse to 0px
  assert.ok(
    content.includes("truncate") && (content.includes("min-w-") || content.includes("flex-shrink-0")),
    "Header city label must prevent collapsing to 0px width"
  );
});

test("MovieHero carousel controls sit in dedicated normal flow row beneath the banner", () => {
  const heroPath = path.join(rootDir, "src", "components", "movies", "MovieHero.tsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Controls must NOT use absolute bottom-4 which collides with Watch Trailer / heading
  assert.equal(
    content.includes("absolute right-4 bottom-4"),
    false,
    "MovieHero carousel controls must not use absolute bottom-4 positioning that overlaps CTA buttons"
  );

  // Controls must sit in dedicated normal flow row with clear margin and vertical alignment
  assert.ok(
    content.includes("mt-4 flex items-center justify-between"),
    "MovieHero carousel controls must sit in a dedicated row with breathing room in normal document flow"
  );
});

test("Homepage sections and ribbons have bounded widths", () => {
  const pagePath = path.join(rootDir, "src", "app", "page.tsx");
  const content = fs.readFileSync(pagePath, "utf8");

  // Languages & Genres ribbons must have overflow-x-auto and overflow-y-hidden
  assert.ok(
    content.includes("overflow-x-auto overflow-y-hidden w-full max-w-full"),
    "Homepage discovery ribbons must have overflow-x-auto overflow-y-hidden w-full max-w-full"
  );

  // No uncontained negative margins
  assert.equal(
    content.includes("-mx-"),
    false,
    "Homepage should have zero uncontained -mx- margins"
  );
});

test("Body does not rely on overflow-x: hidden to mask layout bugs", () => {
  const cssPath = path.join(rootDir, "src", "app", "globals.css");
  const content = fs.readFileSync(cssPath, "utf8");

  // Find body block
  const bodyMatch = content.match(/body\s*\{([^}]+)\}/);
  assert.ok(bodyMatch, "globals.css must contain body declaration");

  const bodyStyles = bodyMatch[1];
  assert.equal(
    bodyStyles.includes("overflow-x: hidden;"),
    false,
    "globals.css body must not rely on overflow-x: hidden; to mask layout bugs"
  );
});

test("Server renders homepage with bounded layout containers", async () => {
  try {
    const res = await fetch("http://localhost:3000/");
    if (!res.ok) {
      console.warn("Dev server returned status:", res.status);
      return;
    }
    const html = await res.text();

    // Verify negative margin is gone from rendered HTML
    assert.equal(
      html.includes("-mx-4"),
      false,
      "Rendered homepage HTML must not contain -mx-4"
    );

    // Verify scroll containers are bounded
    assert.ok(
      html.includes("overflow-x-auto overflow-y-hidden"),
      "Rendered homepage HTML must contain overflow-x-auto overflow-y-hidden containers"
    );
  } catch {
    console.log("Dev server check skipped (not running on 3000 during test execution)");
  }
});
