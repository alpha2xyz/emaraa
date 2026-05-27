/**
 * Owner dashboard tests.
 *
 * SETUP REQUIRED to run the authenticated tests:
 *
 * 1. Log in as a real owner in a browser (phone + OTP).
 * 2. Open DevTools > Application > Local Storage and copy the values of:
 *    - sessionToken
 *    - userId
 *    - userPhone
 *    - userRole  (must be "owner")
 *    - userName
 *    - supabaseToken
 * 3. Paste them into `tests/.auth/owner.json` in this format:
 *
 *    {
 *      "sessionToken": "...",
 *      "userId": "...",
 *      "userPhone": "05xxxxxxxx",
 *      "userRole": "owner",
 *      "userName": "...",
 *      "supabaseToken": "..."
 *    }
 *
 * 4. Remove test.skip() from each describe block you want to run.
 * 5. Run: npx playwright test tests/owner.spec.ts
 *
 * NOTE: The app uses localStorage (not cookies) for auth.
 * Playwright's storageState is used to inject these values before each test.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const AUTH_FILE = path.join(__dirname, ".auth/owner.json");

/** Inject owner localStorage from the saved auth file */
async function injectOwnerAuth(page: import("@playwright/test").Page) {
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(
      `Owner auth file not found at ${AUTH_FILE}. Follow the setup instructions in tests/owner.spec.ts.`
    );
  }
  const auth = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
  await page.goto("/");    // must navigate to origin before setting localStorage
  await page.evaluate((data) => {
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v as string));
  }, auth);
}

// ── Owner Dashboard ───────────────────────────────────────────────────────────

test.describe("Owner Dashboard", () => {
  test.skip("loads the dashboard heading", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner");
    await expect(page.locator("text=لوحة التحكم").first()).toBeVisible();
  });

  test.skip("shows My Properties section", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner");
    await expect(page.locator("text=عقاراتي")).toBeVisible();
  });

  test.skip("shows My Requests section", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner");
    await expect(page.locator("text=طلبات الخدمة")).toBeVisible();
  });

  test.skip("Add Property button is present", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner");
    await expect(page.locator("text=إضافة عقار")).toBeVisible();
  });
});

// ── Properties List ───────────────────────────────────────────────────────────

test.describe("Owner Properties", () => {
  test.skip("loads properties list page", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/properties");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test.skip("navigates to new property form", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/properties");
    // Click add property button
    const addBtn = page.locator("a[href='/dashboard/owner/properties/new']").first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await expect(page).toHaveURL(/properties\/new/);
    }
  });
});

// ── Property Form ─────────────────────────────────────────────────────────────

test.describe("Owner Property Form", () => {
  test.skip("new property form renders required fields", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/properties/new");
    // Property form should have a name/address/type field
    // Exact IDs depend on the form implementation
    await expect(page.locator("form")).toBeVisible();
  });

  test.skip("shows validation error when required fields are empty", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/properties/new");
    // Try to submit empty form
    const submit = page.locator("button[type='submit']").first();
    if (await submit.count() > 0) await submit.click();
    // Some validation error should appear
    const errorCount = await page.locator("[class*='error'], [class*='invalid'], text=مطلوب").count();
    expect(errorCount).toBeGreaterThan(0);
  });
});

// ── Requests List ─────────────────────────────────────────────────────────────

test.describe("Owner Service Requests", () => {
  test.skip("loads requests list page", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/requests");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test.skip("new request form renders", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/requests/new");
    await expect(page.locator("form")).toBeVisible();
  });
});

// ── Owner Offers (viewing offers on requests) ─────────────────────────────────

test.describe("Owner Offers View", () => {
  test.skip("offers page loads for a known request ID", async ({ page }) => {
    /**
     * Replace REPLACE_WITH_REAL_REQUEST_ID with a real request ID from the DB.
     * Get it from Supabase > Table Editor > requests.
     */
    const requestId = process.env.PLAYWRIGHT_TEST_REQUEST_ID ?? "REPLACE_WITH_REAL_REQUEST_ID";
    if (requestId === "REPLACE_WITH_REAL_REQUEST_ID") test.skip();

    await injectOwnerAuth(page);
    await page.goto(`/dashboard/owner/requests/${requestId}/offers`);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});

// ── Owner Onboarding ──────────────────────────────────────────────────────────

test.describe("Owner Onboarding", () => {
  test.skip("onboarding page renders for a fresh owner", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/onboarding");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});

// ── Owner Settings ────────────────────────────────────────────────────────────

test.describe("Owner Settings", () => {
  test.skip("settings page loads", async ({ page }) => {
    await injectOwnerAuth(page);
    await page.goto("/dashboard/owner/settings");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
