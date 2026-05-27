/**
 * Auth page tests.
 *
 * What can run automatically:
 *   - Page structure, form element presence, validation feedback
 *   - Up to the point where the OTP is submitted to Authentica
 *
 * What requires manual setup (skipped by default):
 *   - Full OTP → login flow (requires a real Saudi phone + real SMS)
 *   - Tests marked test.skip() explain what would need to happen
 *
 * IMPORTANT — if running against prod: submitting the phone form WILL
 * send a real SMS via Authentica and write to the otp_rate_limits table.
 * Use a test phone number you control, or run only against local.
 */

import { test, expect } from "@playwright/test";

// ── Auth page structure ───────────────────────────────────────────────────────

test.describe("Auth Page — Owner Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth?role=owner&mode=register");
  });

  test("renders the registration form", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "إنشاء حساب مالك عقار" })).toBeVisible();
  });

  test("shows name and phone fields for registration", async ({ page }) => {
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#phone")).toBeVisible();
  });

  test("shows role selector tabs", async ({ page }) => {
    const ownerTab    = page.locator("button", { hasText: "مالك عقار" });
    const providerTab = page.locator("button", { hasText: "مزود خدمة" });
    await expect(ownerTab).toBeVisible();
    await expect(providerTab).toBeVisible();
  });

  test("shows back-to-home button", async ({ page }) => {
    await expect(page.locator("button", { hasText: "رجوع للصفحة الرئيسية" })).toBeVisible();
  });

  test("shows terms and privacy links", async ({ page }) => {
    await expect(page.locator("a[href='/terms']")).toBeVisible();
    await expect(page.locator("a[href='/privacy']")).toBeVisible();
  });

  test("shows inline error for invalid Saudi phone number", async ({ page }) => {
    await page.fill("#name", "مستخدم تجريبي");
    await page.fill("#phone", "123");           // Not a valid Saudi number
    await page.locator("button[type='submit']").click();
    // The validation error message should appear
    await expect(page.locator("text=رقم جوال سعودي فقط")).toBeVisible();
  });

  test("shows inline error for invalid name", async ({ page }) => {
    await page.fill("#name", "abc123!!!!");      // Contains invalid chars
    await page.fill("#phone", "0512345678");     // Valid format
    await page.locator("button[type='submit']").click();
    await expect(page.locator("text=الاسم يجب أن يكون عربي أو إنجليزي فقط")).toBeVisible();
  });

  test("back button navigates to home", async ({ page }) => {
    await page.locator("button", { hasText: "رجوع للصفحة الرئيسية" }).click();
    await expect(page).toHaveURL("/");
  });
});

// ── Auth page — Owner Login ───────────────────────────────────────────────────

test.describe("Auth Page — Owner Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth?role=owner&mode=login");
  });

  test("renders the login form (no name field)", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "تسجيل دخول مالك عقار" })).toBeVisible();
    // Name field hidden in login mode
    await expect(page.locator("#name")).not.toBeVisible();
    await expect(page.locator("#phone")).toBeVisible();
  });

  test("shows switch to register link", async ({ page }) => {
    await expect(page.locator("button", { hasText: "ليس لديك حساب؟ سجل الآن" })).toBeVisible();
  });

  test("switching to register shows name field", async ({ page }) => {
    await page.locator("button", { hasText: "ليس لديك حساب؟ سجل الآن" }).click();
    await expect(page.locator("#name")).toBeVisible();
  });
});

// ── Auth page — Provider tab ──────────────────────────────────────────────────

test.describe("Auth Page — Provider Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth?role=provider&mode=register");
  });

  test("renders provider registration heading", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "إنشاء حساب مزود خدمة" })).toBeVisible();
  });

  test("owner tab click switches to owner form", async ({ page }) => {
    await page.locator("button", { hasText: "مالك عقار" }).click();
    await expect(page).toHaveURL(/role=owner/);
  });
});

// ── OTP step (manually triggered — see note above) ───────────────────────────

test.describe("Auth Page — OTP Step", () => {
  /**
   * SKIPPED: Full OTP flow requires a real Saudi phone number and an actual
   * SMS from Authentica. To run this test manually:
   *
   * 1. Set PLAYWRIGHT_TEST_PHONE env to a real Saudi phone (e.g. PLAYWRIGHT_TEST_PHONE=0512345678)
   * 2. Remove test.skip() below
   * 3. Run: npx playwright test tests/auth.spec.ts --headed
   * 4. Watch for the SMS on that phone and enter the code manually in the browser
   *
   * Do NOT run this against production in CI — it sends real SMS messages.
   */
  test.skip("OTP step renders after valid phone submit", async ({ page }) => {
    const testPhone = process.env.PLAYWRIGHT_TEST_PHONE ?? "0512345678";
    await page.goto("/auth?role=owner&mode=register");
    await page.fill("#name", "تجريبي");
    await page.fill("#phone", testPhone);
    await page.locator("button[type='submit']").click();
    // After a successful OTP send, the OTP input should appear
    await expect(page.locator("#otp")).toBeVisible({ timeout: 15_000 });
  });

  test.skip("OTP verify button is disabled until 4 digits entered", async ({ page }) => {
    // This test assumes the OTP step is already visible.
    // Populate manually per the note above.
    await page.goto("/auth?role=owner&mode=register");
    // Simulate OTP step by navigating to a state where step === "otp"
    // Currently not possible without sending a real SMS.
  });

  test.skip("Full owner registration with OTP — requires real phone", async ({ page }) => {
    /**
     * Manual steps to make this runnable:
     * 1. Use a real Saudi phone number
     * 2. Submit the form, receive SMS, enter code
     * 3. After success, test expects redirect to /dashboard/owner/onboarding
     */
    const testPhone = process.env.PLAYWRIGHT_TEST_PHONE ?? "";
    if (!testPhone) test.skip();
    await page.goto("/auth?role=owner&mode=register");
    await page.fill("#name", "مستخدم اختبار");
    await page.fill("#phone", testPhone);
    await page.locator("button[type='submit']").click();
    // Wait for OTP field
    await expect(page.locator("#otp")).toBeVisible({ timeout: 15_000 });
    // Enter OTP manually — not automatable without a real OTP interception service
    // After successful verify: expect redirect
    // await expect(page).toHaveURL(/dashboard\/owner\/onboarding/, { timeout: 30_000 });
  });
});

// ── Protected route redirect ──────────────────────────────────────────────────

test.describe("Auth Guard — Redirect to Login", () => {
  test("visiting owner dashboard without auth redirects to /auth", async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto("/dashboard/owner");
    // RequireAuth redirects unauthenticated users
    // The redirect may land on /auth or show the auth page content
    await expect(page).toHaveURL(/\/(auth|$)/, { timeout: 10_000 });
  });

  test("visiting provider dashboard without auth redirects", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard/provider");
    await expect(page).toHaveURL(/\/(auth|$)/, { timeout: 10_000 });
  });
});
