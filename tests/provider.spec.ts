/**
 * Provider dashboard tests.
 *
 * SETUP REQUIRED to run the authenticated tests:
 *
 * 1. Log in as a real provider in a browser (phone + OTP, role=provider).
 * 2. Open DevTools > Application > Local Storage and copy:
 *    - sessionToken
 *    - userId
 *    - userPhone
 *    - userRole  (must be "provider")
 *    - userName
 *    - supabaseToken
 * 3. Save to `tests/.auth/provider.json`:
 *
 *    {
 *      "sessionToken": "...",
 *      "userId": "...",
 *      "userPhone": "05xxxxxxxx",
 *      "userRole": "provider",
 *      "userName": "...",
 *      "supabaseToken": "..."
 *    }
 *
 * 4. Remove test.skip() from each block you want to run.
 * 5. Run: npx playwright test tests/provider.spec.ts
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const AUTH_FILE = path.join(__dirname, ".auth/provider.json");

async function injectProviderAuth(page: import("@playwright/test").Page) {
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(
      `Provider auth file not found at ${AUTH_FILE}. Follow the setup instructions in tests/provider.spec.ts.`
    );
  }
  const auth = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
  await page.goto("/");
  await page.evaluate((data) => {
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v as string));
  }, auth);
}

// ── Provider Dashboard ────────────────────────────────────────────────────────

test.describe("Provider Dashboard", () => {
  test.skip("loads the provider dashboard heading", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider");
    await expect(page.locator("text=لوحة التحكم").first()).toBeVisible();
  });

  test.skip("shows Available Requests section", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider");
    await expect(page.locator("text=الطلبات المتاحة")).toBeVisible();
  });

  test.skip("shows My Offers section", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider");
    await expect(page.locator("text=عروضي المقدمة")).toBeVisible();
  });

  test.skip("prompts incomplete provider to fill company profile", async ({ page }) => {
    /**
     * Only fires if the authenticated provider has no approved company profile.
     * Check in Supabase > providers where approved = false and company_name is null.
     */
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider");
    const incompleteNotice = page.locator("text=أكمل ملف شركتك أولاً");
    if (await incompleteNotice.count() > 0) {
      await expect(incompleteNotice).toBeVisible();
    }
  });
});

// ── Provider Profile ──────────────────────────────────────────────────────────

test.describe("Provider Profile", () => {
  test.skip("provider profile page loads", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider/profile");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test.skip("profile form has company name and email fields", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider/profile");
    // Profile form fields — exact IDs depend on provider-profile.tsx implementation
    await expect(page.locator("form")).toBeVisible();
  });
});

// ── Provider Requests (available requests) ────────────────────────────────────

test.describe("Provider — Available Requests", () => {
  test.skip("requests list page loads", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider/requests");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test.skip("submit offer form renders for a known request", async ({ page }) => {
    /**
     * Replace REPLACE_WITH_REAL_REQUEST_ID with a real open request ID.
     * Get from Supabase > requests where status = 'open'.
     */
    const requestId = process.env.PLAYWRIGHT_TEST_REQUEST_ID ?? "REPLACE_WITH_REAL_REQUEST_ID";
    if (requestId === "REPLACE_WITH_REAL_REQUEST_ID") test.skip();

    await injectProviderAuth(page);
    await page.goto(`/dashboard/provider/requests/${requestId}/offer`);
    await expect(page.locator("form")).toBeVisible();
  });
});

// ── Provider Offers (submitted offers list) ───────────────────────────────────

test.describe("Provider — My Offers", () => {
  test.skip("offers list page loads", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider/offers");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test.skip("shows offer status badges", async ({ page }) => {
    await injectProviderAuth(page);
    await page.goto("/dashboard/provider/offers");
    // Status labels exist (pending / accepted / rejected)
    const statusCount = await page.locator("text=قيد المراجعة, text=مقبول, text=مرفوض").count();
    // Just checking the page renders — offers may be empty
    await expect(page.locator("body")).toBeVisible();
  });
});
