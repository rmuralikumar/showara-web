import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const OUTPUT_DIR = path.join(process.cwd(), ".playwright-artifacts");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Support running on Windows with local Chrome or default Chromium
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "ms-playwright", "chromium-1112", "chrome-win", "chrome.exe"),
];

function getExecutablePath() {
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

const VIEWPORTS = [
  { width: 320, height: 740, name: "320px-compact" },
  { width: 375, height: 812, name: "375px-iphone" },
  { width: 390, height: 844, name: "390px-standard" },
  { width: 428, height: 926, name: "428px-pro-max" },
];

const THEMES = ["dark", "light"];

export async function runVisualVerification() {
  console.log("=== SHOWARA VISUAL & LAYOUT VERIFICATION ===");
  const executablePath = getExecutablePath();
  console.log(`Using Chrome binary: ${executablePath || "default Playwright browser"}`);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const summary = [];

  try {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const testName = `${vp.name}-${theme}`;
        console.log(`\nTesting: [${testName}] (${vp.width}x${vp.height}, theme: ${theme})`);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });

        const page = await context.newPage();

        // Inject initial theme preference before page loads
        await page.addInitScript((t) => {
          try {
            localStorage.setItem("showara_theme", t);
          } catch (e) {}
        }, theme);

        await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });

        // Ensure theme classes on <html>
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
          } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
          }
        }, theme);

        // Allow layout to stabilize
        await page.waitForTimeout(600);

        // Check 1: Horizontal overflow and scrollX
        const overflowMetrics = await page.evaluate(() => {
          const overflowing = [];
          document.querySelectorAll("*").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth || r.left < 0) {
              overflowing.push({
                tag: el.tagName,
                className: (el.className && typeof el.className === "string") ? el.className.slice(0, 80) : "",
                id: el.id || "",
                left: Math.round(r.left),
                right: Math.round(r.right),
                width: Math.round(r.width),
              });
            }
          });
          return {
            scrollX: window.scrollX,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            innerWidth: window.innerWidth,
            overflowing: overflowing.slice(0, 20),
          };
        });

        console.log(`  - Horizontal Metrics: scrollX=${overflowMetrics.scrollX}, scrollWidth=${overflowMetrics.scrollWidth}px, clientWidth=${overflowMetrics.clientWidth}px`);
        if (overflowMetrics.overflowing.length > 0) {
          console.log("  - Overflowing Elements:", JSON.stringify(overflowMetrics.overflowing, null, 2));
        }
        assert.equal(
          overflowMetrics.scrollX,
          0,
          `[${testName}] window.scrollX must be 0 on initial load`
        );
        assert.ok(
          overflowMetrics.scrollWidth <= overflowMetrics.clientWidth + 1,
          `[${testName}] document.documentElement.scrollWidth (${overflowMetrics.scrollWidth}) must not exceed clientWidth (${overflowMetrics.clientWidth})`
        );

        // Check 2: Logo bounding box
        const logoMetrics = await page.evaluate(() => {
          const logo = document.querySelector('a[aria-label="Showara Home"]');
          if (!logo) return null;
          const rect = logo.getBoundingClientRect();
          const wordmark = logo.querySelector("span");
          const wordmarkRect = wordmark ? wordmark.getBoundingClientRect() : null;
          return {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            wordmarkText: wordmark ? wordmark.innerText : null,
            wordmarkLeft: wordmarkRect ? wordmarkRect.left : null,
            wordmarkRight: wordmarkRect ? wordmarkRect.right : null,
          };
        });

        assert.ok(logoMetrics, `[${testName}] Logo element must exist`);
        console.log(`  - Logo Rect: left=${logoMetrics.left.toFixed(1)}px, right=${logoMetrics.right.toFixed(1)}px, width=${logoMetrics.width.toFixed(1)}px`);
        assert.ok(
          logoMetrics.left >= 0,
          `[${testName}] Logo left (${logoMetrics.left}) must not be clipped (< 0)`
        );
        assert.ok(
          logoMetrics.right <= vp.width,
          `[${testName}] Logo right (${logoMetrics.right}) must not exceed viewport (${vp.width})`
        );

        // Check 3: City Location Pill
        const cityPillMetrics = await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label*="Current city"]');
          if (!btn) return null;
          const rect = btn.getBoundingClientRect();
          const textSpan = btn.querySelector("span");
          const textRect = textSpan ? textSpan.getBoundingClientRect() : null;
          return {
            height: rect.height,
            width: rect.width,
            left: rect.left,
            right: rect.right,
            text: textSpan ? textSpan.textContent : null,
            textWidth: textRect ? textRect.width : 0,
          };
        });

        assert.ok(cityPillMetrics, `[${testName}] City pill button must exist`);
        console.log(`  - City Pill: text="${cityPillMetrics.text}", width=${cityPillMetrics.width.toFixed(1)}px, height=${cityPillMetrics.height.toFixed(1)}px, textWidth=${cityPillMetrics.textWidth.toFixed(1)}px`);
        assert.ok(
          cityPillMetrics.height >= 34,
          `[${testName}] City pill height (${cityPillMetrics.height}) must be >= 34px (~36px spec)`
        );
        assert.ok(
          cityPillMetrics.textWidth >= 40,
          `[${testName}] City text label width (${cityPillMetrics.textWidth}) must be >= 40px (not collapsed)`
        );

        // Check 4: Hero Carousel controls and overlap assertion
        const heroMetrics = await page.evaluate(() => {
          const heroSection = document.querySelector("section");
          const card = heroSection ? heroSection.querySelector(".relative.rounded-3xl") : null;
          const trailerBtn = heroSection ? Array.from(heroSection.querySelectorAll("button")).find(b => b.textContent.includes("Watch Trailer")) : null;
          const bookBtn = heroSection ? heroSection.querySelector('a[href*="/movies/"]') : null;
          const dotsContainer = heroSection ? heroSection.querySelector('div[aria-label="Slide 1"]')?.parentElement || heroSection.querySelector('button[aria-label="Slide 1"]')?.parentElement : null;
          const dotsRow = dotsContainer ? dotsContainer.closest(".flex.items-center.justify-between") : null;

          const toRect = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
          };

          return {
            card: toRect(card),
            trailerBtn: toRect(trailerBtn),
            bookBtn: toRect(bookBtn),
            dotsRow: toRect(dotsRow),
            dotsContainer: toRect(dotsContainer),
          };
        });

        assert.ok(heroMetrics.card, `[${testName}] Hero banner card must exist`);
        assert.ok(heroMetrics.dotsRow, `[${testName}] Carousel dots row must exist`);

        console.log(`  - Hero Card bottom: ${heroMetrics.card.bottom.toFixed(1)}px`);
        console.log(`  - Dots Row top: ${heroMetrics.dotsRow.top.toFixed(1)}px, bottom: ${heroMetrics.dotsRow.bottom.toFixed(1)}px`);

        // Assert dots row sits below the banner card in normal flow
        assert.ok(
          heroMetrics.dotsRow.top >= heroMetrics.card.bottom - 2,
          `[${testName}] Dots row (top=${heroMetrics.dotsRow.top}) must sit beneath the media card (bottom=${heroMetrics.card.bottom})`
        );

        // Overlap check function
        const intersects = (r1, r2) => {
          if (!r1 || !r2) return false;
          return !(
            r1.right < r2.left ||
            r1.left > r2.right ||
            r1.bottom < r2.top ||
            r1.top > r2.bottom
          );
        };

        if (heroMetrics.trailerBtn) {
          const trailerOverlap = intersects(heroMetrics.dotsRow, heroMetrics.trailerBtn);
          console.log(`  - Overlap with "Watch Trailer": ${trailerOverlap ? "YES (BUG!)" : "NONE (PASS)"}`);
          assert.equal(
            trailerOverlap,
            false,
            `[${testName}] Dots row must NOT overlap the "Watch Trailer" button`
          );
        }

        if (heroMetrics.bookBtn) {
          const bookOverlap = intersects(heroMetrics.dotsRow, heroMetrics.bookBtn);
          console.log(`  - Overlap with "Book Tickets": ${bookOverlap ? "YES (BUG!)" : "NONE (PASS)"}`);
          assert.equal(
            bookOverlap,
            false,
            `[${testName}] Dots row must NOT overlap the "Book Tickets" button`
          );
        }

        // Check 5: Capture targeted screenshots
        const headerEl = await page.$("header");
        if (headerEl) {
          await headerEl.screenshot({
            path: path.join(OUTPUT_DIR, `header-${vp.width}px-${theme}.png`),
          });
        }

        const heroEl = await page.$("section");
        if (heroEl) {
          await heroEl.screenshot({
            path: path.join(OUTPUT_DIR, `hero-${vp.width}px-${theme}.png`),
          });
        }

        // Full viewport screenshot
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `viewport-${vp.width}px-${theme}.png`),
        });

        summary.push({
          viewport: `${vp.width}x${vp.height}`,
          theme,
          scrollX: overflowMetrics.scrollX,
          logoWidth: logoMetrics.width.toFixed(0),
          cityText: cityPillMetrics.text,
          cityPillHeight: cityPillMetrics.height.toFixed(0),
          dotsRowPosition: `y=${heroMetrics.dotsRow.top.toFixed(0)} (beneath card y=${heroMetrics.card.bottom.toFixed(0)})`,
          overlap: "NONE",
        });

        await context.close();
      }
    }

    console.log("\n=== VISUAL VERIFICATION SUMMARY TABLE ===");
    console.table(summary);
    console.log(`\nAll screenshots saved to: ${OUTPUT_DIR}`);
    return summary;
  } finally {
    await browser.close();
  }
}

// Run directly if invoked via CLI
runVisualVerification()
  .then(() => {
    console.log("\n[SUCCESS] Visual verification completed with 0 errors!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n[FAILURE] Visual verification failed:", err);
    process.exit(1);
  });
