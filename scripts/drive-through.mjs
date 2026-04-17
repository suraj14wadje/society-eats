// Playwright drive-through: exercises the full v2 design flow and captures
// screenshots to evidence/screenshots/. Run from the project root AFTER
// `pnpm start` is listening on :3000 and the local Supabase stack is up.
//
// Usage: node scripts/drive-through.mjs
//
// Exit 0 on success, non-zero on any failure. We log what we did so the
// report in the PR can paste straight from stdout.

import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EVIDENCE_DIR = join(process.cwd(), "evidence", "screenshots");
const DATE_TAG = new Date().toISOString().slice(0, 10);
const TEST_PHONE_DIGITS = "9999900001";
const TEST_PHONE = `+91${TEST_PHONE_DIGITS}`;
const TEST_OTP = "123456";
const TEST_OTP_WRONG = "000000";
const DB_CONTAINER = "supabase_db_society-eats";

mkdirSync(EVIDENCE_DIR, { recursive: true });

function psql(sql) {
  const res = spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "-U", "postgres", "-At", "-c", sql],
    { encoding: "utf8" },
  );
  if (res.status !== 0) {
    throw new Error(`psql failed: ${res.stderr ?? res.stdout}`);
  }
  return res.stdout.trim();
}

function shot(name) {
  return join(EVIDENCE_DIR, `${DATE_TAG}-${name}.png`);
}

async function snap(page, name) {
  const path = shot(name);
  await page.screenshot({ path, fullPage: true });
  console.log(`  📸 ${path}`);
}

async function step(label, fn) {
  console.log(`\n▶ ${label}`);
  await fn();
  console.log(`✓ ${label}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Single context — the session cookie set by the OTP verify step in the
  // happy path needs to be visible to the admin + history + edge-state steps.
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  let orderId = "";

  try {
    await step(
      "01 Public menu → cart → first-time checkout → OTP → confirm",
      async () => {
        await page.goto(BASE_URL, { waitUntil: "networkidle" });
        await page.waitForSelector("text=Paneer Butter Masala Thali");
        await snap(page, "01-menu");

        await page
          .locator('[data-menu-name="Paneer Butter Masala Thali"]')
          .getByRole("button", { name: "ADD" })
          .click();
        const dalRow = page.locator('[data-menu-name="Dal Chawal Thali"]');
        await dalRow.getByRole("button", { name: "ADD" }).click();
        await dalRow.getByRole("button", { name: "Increase" }).click();

        await page.waitForSelector("text=3 Items In Your Thali");
        await snap(page, "02-menu-with-items");

        await page.click("text=View Thali");
        await page.waitForURL("**/cart");
        await page
          .locator("textarea")
          .fill("Less spice, please. Ring bell twice.");
        await snap(page, "03-cart");

        await page.click("text=Checkout");
        await page.waitForURL("**/checkout");
        await page.waitForSelector("text=Your Details");

        await page.fill('input[placeholder="Rohan Iyer"]', "Priya Sharma");
        await page.fill('input[placeholder="98214 10302"]', TEST_PHONE_DIGITS);
        await page.selectOption("select", { label: "Tower C" });
        await page.fill('input[placeholder="0807"]', "1204");
        await page.fill('input[placeholder="Ring Bell Twice"]', "Gate A guard");
        await snap(page, "04-details");

        await page.click("text=Send OTP");
        await page.waitForURL("**/checkout/verify**", { timeout: 15_000 });
        await page.waitForSelector('[data-testid="otp-slots"]');

        // First a wrong code to capture the error state
        for (let i = 0; i < 6; i++) {
          await page.locator(`#otp-${i}`).fill(TEST_OTP_WRONG[i]);
        }
        await page.waitForSelector("text=Incorrect Code", { timeout: 10_000 });
        await snap(page, "05-otp-error");

        // Real OTP — auto-submits on 6th digit
        for (let i = 0; i < 6; i++) {
          await page.locator(`#otp-${i}`).fill(TEST_OTP[i]);
        }

        await page.waitForURL(/\/orders\/[0-9a-f-]+\?fresh=1$/, {
          timeout: 20_000,
        });
        await page.waitForSelector("text=On The Stove");
        await snap(page, "06-confirmation");

        orderId = page.url().match(/orders\/([0-9a-f-]+)/)[1];
        console.log(`  → order id ${orderId}`);
      },
    );

    await step(
      "02 Promote test user to admin + visit queue + advance order",
      async () => {
        psql(
          `update public.profiles set is_admin = true where phone = '${TEST_PHONE}';`,
        );
        console.log("  → promoted user to admin");

        await page.goto(`${BASE_URL}/admin/queue`);
        await page.waitForSelector("text=Today's Board", { timeout: 10_000 });
        await snap(page, "07-admin-queue");

        await page.click("text=Start Cooking →");
        await page.waitForSelector("text=COOKING", { timeout: 10_000 });
        await snap(page, "08-admin-queue-cooking");

        await page.click("text=Send Out →");
        await page.waitForSelector("text=DELIVERING", { timeout: 10_000 });

        await page.click("text=Mark Delivered →");
        await page.waitForSelector("text=DELIVERED", { timeout: 10_000 });
        await snap(page, "09-admin-queue-delivered");
      },
    );

    await step("03 Order status tracker (delivered)", async () => {
      await page.goto(`${BASE_URL}/orders/${orderId}`);
      await page.waitForSelector("text=Delivered");
      await snap(page, "10-status-delivered");
    });

    await step("04 Resident history list (filled)", async () => {
      await page.goto(`${BASE_URL}/history`);
      await page.waitForSelector("text=Past Thalis");
      await snap(page, "11-history-filled");
    });

    await step("05 Returning-user address card (second order)", async () => {
      await page.goto(BASE_URL);
      await page
        .locator('[data-menu-name="Rajma Chawal"]')
        .getByRole("button", { name: "ADD" })
        .click();
      await page.waitForSelector("text=1 Item In Your Thali");
      await page.click("text=View Thali");
      await page.waitForURL("**/cart");
      await page.click("text=Checkout");
      await page.waitForSelector("text=Deliver To", { timeout: 10_000 });
      await snap(page, "12-address-returning");
    });

    await step("06 Edge: kitchen paused → Closed Kitchen screen", async () => {
      psql(`update public.societies set orders_paused = true;`);
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      await page.waitForSelector("text=Meera Is Resting");
      await snap(page, "13-edge-closed-kitchen");
      psql(`update public.societies set orders_paused = false;`);
    });

    await step(
      "07 Edge: mostly sold out (only Khichdi available)",
      async () => {
        psql(
          "update public.menu_items set is_available = false where name <> 'Moong Khichdi'; " +
            "update public.menu_items set is_available = true, stock = 5 where name = 'Moong Khichdi';",
        );
        await page.goto(BASE_URL, { waitUntil: "networkidle" });
        await page.waitForSelector("text=Moong Khichdi");
        await snap(page, "14-edge-sold-out");
        psql(
          "update public.menu_items set is_available = true where name <> 'Moong Khichdi'; " +
            "update public.menu_items set is_available = false, stock = 0 where name = 'Moong Khichdi';",
        );
      },
    );

    await step("08 Admin controls panel", async () => {
      await page.goto(`${BASE_URL}/admin/controls`);
      await page.waitForSelector("text=Kitchen Controls", { timeout: 10_000 });
      await snap(page, "15-admin-controls");
    });

    await step("09 Empty history (use second throwaway profile)", async () => {
      // Demote admin back + delete orders + clear cart so a fresh page feels
      // like a user with no history.
      psql("update public.profiles set is_admin = false;");
      // History page still authed as same user; clear orders first so list
      // renders the empty variant.
      psql("delete from public.order_items; delete from public.orders;");
      await page.goto(`${BASE_URL}/history`);
      await page.waitForSelector("text=No Thalis");
      await snap(page, "16-history-empty");
    });

    await step("10 Desktop sanity shot", async () => {
      const desktopCtx = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });
      const dp = await desktopCtx.newPage();
      await dp.goto(BASE_URL, { waitUntil: "networkidle" });
      await dp.waitForSelector("text=Paneer Butter Masala Thali");
      await snap(dp, "17-desktop-menu");
      await desktopCtx.close();
    });

    console.log("\n✅ All drive-through steps complete.");
  } catch (err) {
    console.error("\n❌ Drive-through failed:", err);
    try {
      await snap(page, "FAILURE");
    } catch {
      /* ignore */
    }
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
}

main();
