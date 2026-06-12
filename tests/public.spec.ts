/**
 * Public pages smoke tests — no auth required.
 *
 * These tests run against both local and prod.
 * All tests here should pass without any login state.
 */

import { test, expect } from "@playwright/test";

// ── Landing Page ─────────────────────────────────────────────────────────────

test.describe("Landing Page", () => {
  test("loads and shows the brand name", async ({ page }) => {
    await page.goto("/");
    // Arabic brand name (elongated wordmark عِمــارة) — default language is ar.
    // This is the primary "the app actually rendered" signal: a blank page fails here.
    await expect(page.locator("text=عِمــارة").first()).toBeVisible();
  });

  test("shows hero headline", async ({ page }) => {
    await page.goto("/");
    // The hero highlight text rendered in Arabic
    await expect(page.locator("text=عمارتك، مُدارة بكفاءة")).toBeVisible();
  });

  test("shows the How It Works section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#how-it-works")).toBeVisible();
  });

  test("shows the provider CTA section", async ({ page }) => {
    await page.goto("/");
    // Provider CTA heading (current copy)
    await expect(page.locator("text=هل أنت شركة إدارة مرافق؟")).toBeVisible();
  });

  test("footer shows copyright", async ({ page }) => {
    await page.goto("/");
    // Stable legal text — survives brand-wordmark tweaks
    await expect(page.locator("text=جميع الحقوق محفوظة").first()).toBeVisible();
  });

  test("footer Quick Links navigates to /contact", async ({ page }) => {
    await page.goto("/");
    // Target the stable href, not volatile link copy
    const link = page.locator("footer a[href='/contact']").first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test("footer Quick Links navigates to /about", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("footer a[href='/about']").first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test("Get Started button navigates to /auth?role=owner", async ({ page }) => {
    await page.goto("/");
    await page.locator("a[href='/auth?role=owner']").first().click();
    await expect(page).toHaveURL(/\/auth\?role=owner/);
  });

  test("language toggle switches to English", async ({ page }) => {
    await page.goto("/");
    // Find the Globe toggle button labelled "EN"
    const toggle = page.locator("button", { hasText: "EN" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("text=EMARAA").first()).toBeVisible();
  });
});

// ── About Page ───────────────────────────────────────────────────────────────

test.describe("About Page", () => {
  test("loads without error", async ({ page }) => {
    await page.goto("/about");
    // Expect some visible heading — no hard-coded text to keep it resilient
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Confirm no generic error boundary text
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("page title is set", async ({ page }) => {
    await page.goto("/about");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

// ── Contact Page ─────────────────────────────────────────────────────────────

test.describe("Contact Page", () => {
  test("loads without error", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("shows contact information or a form", async ({ page }) => {
    await page.goto("/contact");
    // Should contain a phone or email reference or a form element
    const hasPhone = await page.locator("text=966").count() > 0;
    const hasForm  = await page.locator("form").count() > 0;
    const hasEmail = await page.locator("text=emaraa.app").count() > 0;
    expect(hasPhone || hasForm || hasEmail).toBeTruthy();
  });
});

// ── Terms Page ───────────────────────────────────────────────────────────────

test.describe("Terms of Use Page", () => {
  test("loads at /terms", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("contains legal/terms content", async ({ page }) => {
    await page.goto("/terms");
    // Arabic keyword for terms
    const hasTerms = await page.locator("text=شروط").count() > 0;
    const hasTermsEn = await page.locator("text=Terms").count() > 0;
    expect(hasTerms || hasTermsEn).toBeTruthy();
  });
});

// ── Privacy Page ─────────────────────────────────────────────────────────────

test.describe("Privacy Policy Page", () => {
  test("loads at /privacy", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("contains privacy-related content", async ({ page }) => {
    await page.goto("/privacy");
    const hasPrivacyAr = await page.locator("text=خصوصية").count() > 0;
    const hasPrivacyEn = await page.locator("text=Privacy").count() > 0;
    expect(hasPrivacyAr || hasPrivacyEn).toBeTruthy();
  });
});

// ── 404 Page ─────────────────────────────────────────────────────────────────

test.describe("404 Page", () => {
  test("shows not-found page for unknown route", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-abc123");
    // The app renders a 404/not-found component (wouter catches the default route)
    // Check that it doesn't crash and shows something meaningful
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
