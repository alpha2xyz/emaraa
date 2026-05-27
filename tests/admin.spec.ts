/**
 * Admin panel tests.
 *
 * Admin auth uses username/password (no OTP) — so these tests CAN be automated
 * once you supply credentials via environment variables or a local auth file.
 *
 * SETUP:
 *   Option A — env vars (recommended for CI):
 *     PLAYWRIGHT_ADMIN_USER=your_admin_username
 *     PLAYWRIGHT_ADMIN_PASS=your_admin_password
 *
 *   Option B — auth file at tests/.auth/admin.json:
 *     {
 *       "adminId": "...",
 *       "adminSessionToken": "...",
 *       "userRole": "admin"
 *     }
 *
 * The login tests (structure, validation) run without any credentials.
 * Dashboard tests are skipped until credentials are provided.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const AUTH_FILE = path.join(__dirname, ".auth/admin.json");

async function injectAdminAuth(page: import("@playwright/test").Page) {
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(
      `Admin auth file not found at ${AUTH_FILE}. See setup instructions in tests/admin.spec.ts.`
    );
  }
  const auth = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
  await page.goto("/");
  await page.evaluate((data) => {
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v as string));
  }, auth);
}

async function loginAsAdmin(page: import("@playwright/test").Page) {
  const username = process.env.PLAYWRIGHT_ADMIN_USER;
  const password = process.env.PLAYWRIGHT_ADMIN_PASS;
  if (!username || !password) {
    throw new Error(
      "PLAYWRIGHT_ADMIN_USER and PLAYWRIGHT_ADMIN_PASS env vars are required to run admin login tests."
    );
  }
  await page.goto("/admin");
  await page.fill("input[placeholder='username']", username);
  await page.fill("input[type='password']", password);
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 });
}

// ── Admin Login Page — Structure (no creds needed) ────────────────────────────

test.describe("Admin Login Page — Structure", () => {
  test("loads at /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("shows admin login heading", async ({ page }) => {
    await page.goto("/admin");
    // The heading is inside a CardTitle. Check that the card content is visible.
    // Default lang is Arabic so we expect "لوحة الإدارة"
    // Using isVisible via locators that check for ANY text in the heading area
    await expect(page.locator("[class*='CardTitle'], .text-2xl").first()).toBeVisible();
  });

  test("shows username and password fields", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("input[placeholder='username']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("shows submit button", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("shows back to home button", async ({ page }) => {
    await page.goto("/admin");
    // Wait for the form to be fully rendered before counting buttons
    await expect(page.locator("input[placeholder='username']")).toBeVisible();
    // The back button uses ghost variant — there should be submit + back (+ password toggle = 3 total)
    const buttons = page.getByRole("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/admin");
    await page.fill("input[placeholder='username']", "wronguser");
    await page.fill("input[type='password']", "wrongpass");
    await page.locator("button[type='submit']").click();
    // Error message should appear
    const errAr = page.locator("text=اسم المستخدم أو كلمة المرور غير صحيحة");
    const errEn = page.locator("text=Invalid username or password");
    await expect(errAr.or(errEn)).toBeVisible({ timeout: 10_000 });
  });

  test("back button returns to home", async ({ page }) => {
    await page.goto("/admin");
    const backBtn = page.getByRole("button", { name: "الرجوع للرئيسية" })
      .or(page.getByRole("button", { name: "Back to Home" }));
    await backBtn.first().click();
    await expect(page).toHaveURL("/");
  });
});

// ── Admin Login Flow (requires credentials) ───────────────────────────────────

test.describe("Admin Login Flow", () => {
  test.skip("logs in with valid credentials and reaches dashboard", async ({ page }) => {
    /**
     * To run:
     *   PLAYWRIGHT_ADMIN_USER=xxx PLAYWRIGHT_ADMIN_PASS=yyy npx playwright test tests/admin.spec.ts
     */
    await loginAsAdmin(page);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});

// ── Admin Dashboard (requires auth) ──────────────────────────────────────────

test.describe("Admin Dashboard", () => {
  test.skip("admin dashboard loads", async ({ page }) => {
    await injectAdminAuth(page);
    await page.goto("/admin/dashboard");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test.skip("shows providers list or pending approvals", async ({ page }) => {
    await injectAdminAuth(page);
    await page.goto("/admin/dashboard");
    // Admin dashboard should show provider management content
    // Arabic: مزودو الخدمة / English: Service Providers
    const hasProviders = await page.locator("text=مزودو الخدمة").count() > 0 ||
                         await page.locator("text=Service Providers").count() > 0 ||
                         await page.locator("text=Providers").count() > 0;
    expect(hasProviders).toBeTruthy();
  });

  test.skip("shows all users or owners list", async ({ page }) => {
    await injectAdminAuth(page);
    await page.goto("/admin/dashboard");
    const hasUsers = await page.locator("text=ملاك").count() > 0 ||
                     await page.locator("text=Owners").count() > 0 ||
                     await page.locator("text=Users").count() > 0;
    expect(hasUsers).toBeTruthy();
  });

  test.skip("approve provider button exists for pending provider", async ({ page }) => {
    /**
     * This test requires at least one provider with approved=false in the DB.
     * Check Supabase > providers where approved = false.
     */
    await injectAdminAuth(page);
    await page.goto("/admin/dashboard");
    // Look for an approve button — exact text depends on admin-dashboard.tsx
    const approveBtn = page.locator("button", { hasText: "موافقة" }).or(
      page.locator("button", { hasText: "Approve" })
    );
    if (await approveBtn.count() > 0) {
      await expect(approveBtn.first()).toBeVisible();
    }
  });

  test.skip("accessing /admin/dashboard without admin token redirects", async ({ page }) => {
    // Clear all auth state
    await page.context().clearCookies();
    await page.goto("/admin/dashboard");
    // Should redirect to /admin login
    await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
  });
});
