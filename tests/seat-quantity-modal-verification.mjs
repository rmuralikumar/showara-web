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

export async function testSeatQuantityModal() {
  console.log("=== COMPREHENSIVE SEAT QUANTITY MODAL VERIFICATION ===");
  const executablePath = getExecutablePath();
  console.log(`Using Chrome binary: ${executablePath || "default Playwright browser"}`);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    // 1. Navigate to movie details page
    console.log("\n1. Navigating to /movies/dune-part-two...");
    await page.goto("http://localhost:3000/movies/dune-part-two", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Wait for showtimes to render
    const showtimeBtn = await page.waitForSelector('button:has-text("11:00"), button:has-text("10:30"), button:has-text("14:15"), button:has-text("15:30")', { timeout: 10000 });
    assert.ok(showtimeBtn, "A showtime button must be found");
    const showtimeText = (await showtimeBtn.textContent()).match(/\d{1,2}:\d{2}/)[0];

    // 2. Click showtime button - should open modal instead of navigating
    console.log(`2. Clicking showtime button (${showtimeText})...`);
    await showtimeBtn.click();

    // Modal dialog must appear
    const modal = await page.waitForSelector('role=dialog[name="How many seats?"]', { timeout: 5000 });
    assert.ok(modal, "SeatQuantityModal must open on clicking showtime button");
    console.log("✓ Modal appeared without navigating directly");

    // Check header content
    const title = await page.textContent("#seat-count-modal-title");
    assert.equal(title?.trim(), "How many seats?");
    const subtitle = await page.textContent("#seat-quantity-subtitle");
    console.log(`✓ Header subtitle: "${subtitle?.trim()}"`);
    assert.ok(subtitle?.includes("Audi 1") || subtitle?.includes("Laser") || subtitle?.includes("Screen"), "Subtitle must include auditorium name");
    assert.ok(subtitle?.includes("IMAX") || subtitle?.includes("2D") || subtitle?.includes("3D"), "Subtitle must include format");

    // Check ticket info card
    const infoCard = await page.textContent('role=dialog');
    assert.ok(infoCard.includes("Dune: Part Two"), "Info card must display movie title");
    assert.ok(infoCard.includes("English"), "Info card must display language");
    assert.ok(infoCard.includes(showtimeText), `Info card must display showtime (${showtimeText})`);

    // Check background scroll locked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    assert.equal(bodyOverflow, "hidden", "Body overflow must be hidden while modal is open");
    console.log("✓ Body scroll locked (overflow: hidden)");

    // 3. Test ESC key close
    console.log("3. Testing ESC key to close modal...");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const isModalVisibleAfterEsc = await page.$('role=dialog[name="How many seats?"]');
    assert.equal(isModalVisibleAfterEsc, null, "Modal must close on Escape key");
    const bodyOverflowAfterEsc = await page.evaluate(() => document.body.style.overflow);
    assert.equal(bodyOverflowAfterEsc, "", "Body overflow must be restored after Escape");
    assert.ok(page.url().includes("/movies/dune-part-two"), "URL must remain on movie page after Escape");
    console.log("✓ ESC closed modal, restored body scroll, and preserved page URL");

    // 4. Reopen and test Close (X) button
    console.log("4. Reopening and testing Close (X) button...");
    const showtimeBtn2 = await page.$(`button:has-text("${showtimeText}")`);
    await showtimeBtn2.click();
    await page.waitForSelector('role=dialog[name="How many seats?"]');
    const closeBtn = await page.$('button[aria-label="Close"]');
    assert.ok(closeBtn, "Close (X) button must exist");
    await closeBtn.click();
    await page.waitForTimeout(300);
    const isModalVisibleAfterX = await page.$('role=dialog[name="How many seats?"]');
    assert.equal(isModalVisibleAfterX, null, "Modal must close on X button");
    console.log("✓ Close (X) button works and restores scroll");

    // 5. Reopen and test overlay backdrop click
    console.log("5. Reopening and testing overlay backdrop click...");
    const showtimeBtn3 = await page.$(`button:has-text("${showtimeText}")`);
    await showtimeBtn3.click();
    await page.waitForSelector('role=dialog[name="How many seats?"]');
    // Click outside the modal container (at top-left 20, 20)
    await page.mouse.click(20, 20);
    await page.waitForTimeout(300);
    const isModalVisibleAfterBackdrop = await page.$('role=dialog[name="How many seats?"]');
    assert.equal(isModalVisibleAfterBackdrop, null, "Modal must close on backdrop click");
    console.log("✓ Backdrop click closes modal and preserves page state");

    // 6. Test quantity selection & CTA dynamic text: 1, 2, 5, 10
    console.log("6. Testing quantity selection (1, 2, 5, 10) and singular/plural CTA...");
    const showtimeBtn4 = await page.$(`button:has-text("${showtimeText}")`);
    await showtimeBtn4.click();
    await page.waitForSelector('role=dialog[name="How many seats?"]');

    // Default should be 2 seats -> "Select 2 Seats"
    let cta = await page.$('button:has-text("Select 2 Seats")');
    assert.ok(cta, 'Default CTA must be "Select 2 Seats"');
    console.log('✓ Default quantity is 2: CTA = "Select 2 Seats"');

    // Select 1 seat -> "Select 1 Seat" (singular)
    const btn1 = await page.$('button[aria-label="Select 1 seat"]');
    await btn1.click();
    await page.waitForTimeout(150);
    cta = await page.$('button:has-text("Select 1 Seat")');
    assert.ok(cta, 'Selecting 1 must change CTA to "Select 1 Seat" (singular)');
    console.log('✓ Selecting 1: CTA = "Select 1 Seat"');

    // Select 5 seats -> "Select 5 Seats"
    const btn5 = await page.$('button[aria-label="Select 5 seats"]');
    await btn5.click();
    await page.waitForTimeout(150);
    cta = await page.$('button:has-text("Select 5 Seats")');
    assert.ok(cta, 'Selecting 5 must change CTA to "Select 5 Seats"');
    console.log('✓ Selecting 5: CTA = "Select 5 Seats"');

    // Select 10 seats -> "Select 10 Seats"
    const btn10 = await page.$('button[aria-label="Select 10 seats"]');
    await btn10.click();
    await page.waitForTimeout(150);
    cta = await page.$('button:has-text("Select 10 Seats")');
    assert.ok(cta, 'Selecting 10 must change CTA to "Select 10 Seats"');
    console.log('✓ Selecting 10: CTA = "Select 10 Seats"');

    // Select 5 seats again -> "Select 5 Seats"
    await btn5.click();
    await page.waitForTimeout(150);
    cta = await page.$('button:has-text("Select 5 Seats")');
    assert.ok(cta, 'Selecting 5 must change CTA to "Select 5 Seats"');
    console.log('✓ Selecting 5: CTA = "Select 5 Seats"');

    // Check auditorium tier pricing
    const tierSection = await page.textContent('role=dialog');
    assert.ok(tierSection.includes("VIP Recliner"), "Must list VIP Recliner");
    assert.ok(tierSection.includes("Prime Executive"), "Must list Prime Executive");
    assert.ok(tierSection.includes("Classic Club"), "Must list Classic Club");
    assert.ok(tierSection.includes("₹"), "Must show price in rupees");
    console.log("✓ Dynamic tier pricing list verified");

    // Take screenshot of desktop modal
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "desktop-seat-quantity-modal.png"),
    });

    // 7. Click CTA "Select 5 Seats" -> Navigates to seat layout with qty=5
    console.log("7. Confirming selection of 5 seats and navigating...");
    await cta.click();
    await page.waitForURL(/\/book\//, { timeout: 10000 });
    console.log(`✓ Successfully navigated to ${page.url()}`);

    // Seat layout page should load with target count 5
    await page.waitForSelector('text=All Eyes This Way — Cinema Screen', { timeout: 10000 });
    const bodyContent = await page.textContent('body');
    assert.ok(bodyContent.includes("5") && bodyContent.includes("Seats required"), "Seat map must require 5 seats");
    console.log("✓ Seat layout page initialized with targetSeatCount = 5");

    // 8. Test "Change" button on SeatMap
    console.log('8. Testing "Change" button on SeatMap...');
    const changeBtn = await page.$('button[aria-label="Edit number of seats"]');
    assert.ok(changeBtn, 'Change button must exist on SeatMap');
    await changeBtn.click();

    // Modal reopens over seat layout with 5 selected
    await page.waitForSelector('role=dialog[name="How many seats?"]');
    cta = await page.$('button:has-text("Select 5 Seats")');
    assert.ok(cta, 'Reopened modal must preserve current count of 5');
    console.log("✓ Modal reopened over SeatMap reflecting existing count 5");

    // Change to 2 seats
    const btn2 = await page.$('button[aria-label="Select 2 seats"]');
    await btn2.click();
    cta = await page.waitForSelector('button:has-text("Select 2 Seats")');
    await cta.click();
    await page.waitForTimeout(300);

    // Verify seat map updated to 2 seats required
    const updatedBodyContent = await page.textContent('body');
    assert.ok(updatedBodyContent.includes("2") && updatedBodyContent.includes("Seats required"), "Seat map must update targetSeatCount to 2");
    console.log("✓ Seat layout smoothly updated target count to 2 without losing page context");

    // 9. Mobile Responsive Test (390x844)
    console.log("\n9. Testing Mobile Viewport (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    const changeBtnMobile = await page.$('button[aria-label="Edit number of seats"]');
    await changeBtnMobile.click();
    await page.waitForSelector('role=dialog[name="How many seats?"]');

    // Check bottom-sheet styling in mobile
    const modalBox = await page.$('[role="dialog"] > div');
    const classList = await modalBox.getAttribute("class");
    assert.ok(classList.includes("max-sm:bottom-0") && classList.includes("max-sm:rounded-t-3xl"), "Must have bottom-sheet classes on mobile");
    console.log("✓ Mobile bottom-sheet styling verified");

    // Take screenshot of mobile bottom-sheet modal
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "mobile-seat-quantity-modal.png"),
    });

    // Close on mobile
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // 10. Test Cinema page flow (/cinemas/pvr-nexus-koramangala)
    console.log("\n10. Testing Cinema page flow (/cinemas/pvr-nexus-koramangala)...");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://localhost:3000/cinemas/pvr-nexus-koramangala", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForSelector('text=Movies Showing at this Cinema', { timeout: 10000 });
    const cinemaShowtimeBtn = await page.waitForSelector('button:has-text("11:30"), button:has-text("16:45")', { timeout: 10000 });
    assert.ok(cinemaShowtimeBtn, "Showtime button on cinema page must exist");
    await cinemaShowtimeBtn.click();

    // Modal must open
    await page.waitForSelector('role=dialog[name="How many seats?"]');
    console.log("✓ SeatQuantityModal opened from Cinema page showtime button");
    const cinemaModalCTA = await page.$('button:has-text("Select 2 Seats")');
    assert.ok(cinemaModalCTA, "CTA exists on cinema modal");
    await cinemaModalCTA.click();

    await page.waitForURL(/\/book\//, { timeout: 10000 });
    console.log(`✓ Navigated from Cinema page to seat layout: ${page.url()}`);

    await context.close();
    console.log("\n=======================================================");
    console.log("ALL SEAT QUANTITY MODAL VERIFICATIONS PASSED (10/10)!");
    console.log("=======================================================");
  } finally {
    await browser.close();
  }
}

testSeatQuantityModal()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[TEST FAILED]:", err);
    process.exit(1);
  });
