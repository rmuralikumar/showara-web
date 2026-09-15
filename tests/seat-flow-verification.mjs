import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const OUTPUT_DIR = path.join(process.cwd(), ".playwright-artifacts");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "ms-playwright", "chromium-1112", "chrome-win", "chrome.exe"),
];

function getExecutablePath() {
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}

export async function runSeatFlowVerification() {
  console.log("=== SHOWARA TWO-STEP SEAT SELECTION FLOW VERIFICATION ===");
  const executablePath = getExecutablePath();
  console.log(`Using Chrome binary: ${executablePath || "default Playwright browser"}`);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const testConfigs = [
    { width: 390, height: 844, theme: "dark", name: "mobile-390px-dark" },
    { width: 1280, height: 800, theme: "light", name: "desktop-1280px-light" },
  ];

  try {
    for (const config of testConfigs) {
      console.log(`\nTesting: [${config.name}] (${config.width}x${config.height}, theme: ${config.theme})`);

      const context = await browser.newContext({
        viewport: { width: config.width, height: config.height },
        colorScheme: config.theme,
      });

      const page = await context.newPage();
      await page.goto("http://localhost:3000/book/show-dune-nexus-1", {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Wait for auditorium to load
      await page.waitForSelector('role=dialog[name="How many seats?"]', { timeout: 10000 });

      // ==========================================
      // STEP 1 VERIFICATION: SeatCountModal
      // ==========================================
      console.log("-> Testing Step 1: SeatCountModal");
      const modalTitle = await page.textContent("#seat-count-modal-title");
      assert.equal(modalTitle?.trim(), "How many seats?");

      // Check numbers 1 to 10
      for (let i = 1; i <= 10; i++) {
        const numBtn = await page.$(`button[aria-label="Select ${i} seat${i > 1 ? "s" : ""}"]`);
        assert.ok(numBtn, `Number button ${i} must exist in Step 1`);
      }

      // Check per-show dynamic pricing for Dune show-dune-nexus-1: Recliner: 550, Prime: 380, Classic: 250
      const pageText = await page.textContent("body");
      assert.ok(pageText.includes("₹550"), "Must show Recliner ₹550 from show.priceConfig");
      assert.ok(pageText.includes("₹380"), "Must show Prime ₹380 from show.priceConfig");
      assert.ok(pageText.includes("₹250"), "Must show Classic ₹250 from show.priceConfig");

      // Check bestseller banner
      assert.ok(
        pageText.includes("Bestseller Seats"),
        "Must display dynamic Bestseller Seats banner"
      );

      // Capture Step 1 Modal Screenshot
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `step1-seat-count-modal-${config.name}.png`),
      });

      // Select 3 seats in modal
      const btn3 = await page.$('button[aria-label="Select 3 seats"]');
      await btn3.click();
      await page.waitForTimeout(200);

      // Confirm Step 1
      const selectSeatsCTA = await page.$('button:has-text("Select 3 Seats")');
      assert.ok(selectSeatsCTA, "CTA must reflect selected 3 seats");
      await selectSeatsCTA.click();

      // ==========================================
      // STEP 2 VERIFICATION: SeatMap
      // ==========================================
      console.log("-> Testing Step 2: SeatMap");
      await page.waitForSelector("text=All Eyes This Way — Cinema Screen", { timeout: 5000 });

      // Check screen indicator and tier sections
      const screenIndicator = await page.$("text=All Eyes This Way — Cinema Screen");
      assert.ok(screenIndicator, "Screen indicator bar must be visible");

      // Verify zoom controls exist with aria-labels
      const zoomInBtn = await page.$('button[aria-label="Zoom in"]');
      const zoomOutBtn = await page.$('button[aria-label="Zoom out"]');
      const resetZoomBtn = await page.$('button[aria-label="Reset zoom"]');
      assert.ok(zoomInBtn, "Zoom in button must exist with aria-label");
      assert.ok(zoomOutBtn, "Zoom out button must exist with aria-label");
      assert.ok(resetZoomBtn, "Reset zoom button must exist with aria-label");

      // Test Zoom In
      await zoomInBtn.click();
      await page.waitForTimeout(200);

      // Test tap target hit testing at zoom: Click 3 available seats
      const availableSeats = await page.$$('button[aria-label*="available"]:not([disabled])');
      assert.ok(availableSeats.length >= 4, "Must have available seats to select");

      await availableSeats[0].click();
      await page.waitForTimeout(150);
      await availableSeats[1].click();
      await page.waitForTimeout(150);
      await availableSeats[2].click();
      await page.waitForTimeout(200);

      // Try clicking a 4th seat: Must be blocked and prompt user!
      await availableSeats[3].click();
      await page.waitForTimeout(200);

      // Verify warning prompt appears
      const noticeEl = await page.$('[role="alert"]');
      assert.ok(noticeEl, "Warning notice must appear on attempting to exceed chosen count");
      const noticeText = await noticeEl.textContent();
      assert.ok(
        noticeText.includes("You chose 3 seats") || noticeText.includes("Deselect"),
        `Notice must prompt to deselect. Got: ${noticeText}`
      );

      // Verify Proceed to Pay button is enabled with exact 3 seats
      const proceedBtn = await page.$('button:has-text("Proceed to Pay")');
      assert.ok(proceedBtn, "Proceed to Pay CTA must be enabled when 3 seats are selected");
      const isDisabled = await proceedBtn.getAttribute("disabled");
      assert.equal(isDisabled, null, "Proceed to Pay must NOT be disabled when exact count is chosen");

      // Capture Step 2 Seat Map Screenshot
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `step2-seat-map-${config.name}.png`),
      });

      // Test Edit Count: Reopen modal without losing context
      const changeBtn = await page.$('button[aria-label="Edit number of seats"]');
      assert.ok(changeBtn, "Change seats count button must exist");
      await changeBtn.click();

      // Modal reopens
      await page.waitForSelector("#seat-count-modal-title", { timeout: 3000 });
      const select2Seats = await page.$('button[aria-label="Select 2 seats"]');
      await select2Seats.click();
      const confirm2Btn = await page.$('button:has-text("Select 2 Seats")');
      await confirm2Btn.click();

      await page.waitForTimeout(300);
      const updatedPill = await page.textContent("body");
      assert.ok(
        updatedPill.includes("Seats required:") && updatedPill.includes("2"),
        "Target seat count must be smoothly updated to 2"
      );

      await context.close();
    }

    console.log("\n[SUCCESS] Two-step seat selection flow verified successfully!");
  } finally {
    await browser.close();
  }
}

// Run if called via CLI
runSeatFlowVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[FAILURE] Seat flow verification failed:", err);
    process.exit(1);
  });
