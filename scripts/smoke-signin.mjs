import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PHONE_DIGITS = process.env.SMOKE_PHONE_DIGITS ?? "9999900001";
const OTP = process.env.SMOKE_OTP ?? "123456";
const DATE = new Date().toISOString().slice(0, 10);

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();

  console.log("→ /signin");
  await page.goto(`${BASE}/signin`);
  await page.waitForSelector("#phone-digits");
  await page.fill("#phone-digits", PHONE_DIGITS);
  await page.screenshot({
    path: `evidence/screenshots/${DATE}-issue-2-signin-filled.png`,
    fullPage: true,
  });
  await page.click('button[type="submit"]');

  console.log("→ /verify");
  await page.waitForURL(/\/verify/);
  await page.waitForSelector('input[data-input-otp="true"]');
  await page.focus('input[data-input-otp="true"]');
  await page.keyboard.type(OTP);
  await page.screenshot({
    path: `evidence/screenshots/${DATE}-issue-2-verify-filled.png`,
    fullPage: true,
  });
  await page.click('button[type="submit"]');

  console.log("→ /onboarding");
  await page.waitForURL(/\/onboarding/, { timeout: 15_000 });
  await page.waitForSelector("#full_name");
  await page.screenshot({
    path: `evidence/screenshots/${DATE}-issue-2-onboarding.png`,
    fullPage: true,
  });

  console.log("filling onboarding form");
  await page.fill("#full_name", "Test Resident");
  await page.click("#building_id");
  await page.locator('[role="option"]').first().click();
  await page.fill("#flat_number", "A-101");
  await page.screenshot({
    path: `evidence/screenshots/${DATE}-issue-2-onboarding-filled.png`,
    fullPage: true,
  });
  await page.click('button[type="submit"]');

  console.log("→ /menu");
  await page.waitForURL(/\/menu/, { timeout: 15_000 });
  await page.waitForSelector("h1");
  await page.screenshot({
    path: `evidence/screenshots/${DATE}-issue-2-menu-stub.png`,
    fullPage: true,
  });

  console.log("testing middleware redirect on /signin while authed");
  await page.goto(`${BASE}/signin`);
  await page.waitForURL(/\/menu/, { timeout: 5_000 });

  console.log("testing sign out");
  await page.click('button:has-text("Sign out")');
  await page.waitForURL(/\/signin/, { timeout: 10_000 });
  await page.screenshot({
    path: `evidence/screenshots/${DATE}-issue-2-after-signout.png`,
    fullPage: true,
  });

  await browser.close();
  console.log("✓ smoke passed");
}

main().catch((err) => {
  console.error("✗ smoke failed:", err.message);
  process.exit(1);
});
