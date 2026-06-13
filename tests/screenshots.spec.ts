/**
 * Captures a full-page screenshot of every public page, in both Arabic and
 * English. Runs in CI against the built bundle and uploads the PNGs as a
 * downloadable artifact — a visual gallery of the whole public site, rendered
 * on a real (Linux) browser. Screenshots are captured even if a page is blank,
 * so a regression is visible (the render gate in public.spec.ts is what FAILS).
 */
import { test } from "@playwright/test";
import fs from "fs";

const DIR = "screenshots";
fs.mkdirSync(DIR, { recursive: true });

const pages: { name: string; path: string }[] = [
  { name: "01-landing", path: "/" },
  { name: "02-auth-owner", path: "/auth?role=owner" },
  { name: "03-auth-provider", path: "/auth?role=provider" },
  { name: "04-about", path: "/about" },
  { name: "05-contact", path: "/contact" },
  { name: "06-terms", path: "/terms" },
  { name: "07-privacy", path: "/privacy" },
  { name: "08-not-found", path: "/this-route-does-not-exist-abc123" },
];

for (const p of pages) {
  test(`screenshot ${p.name}`, async ({ page }) => {
    await page.goto(p.path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(800); // let fonts + animations settle
    await page.screenshot({ path: `${DIR}/${p.name}.png`, fullPage: true });
  });
}
