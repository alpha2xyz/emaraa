import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// Bundling the full @sparticuz/chromium binary (~65MB) directly into api/index.ts would ship it
// inside the single serverless function that serves every route in this app (OTP, cron, admin —
// see vercel.json's catch-all rewrite). @sparticuz/chromium-min instead fetches the Brotli pack
// from a URL at cold start, keeping the function bundle small. Default points at Sparticuz's own
// GitHub release asset; override via env if that host ever proves unreliable (e.g. to a
// self-hosted copy on Vercel Blob) without a code change.
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_REMOTE_PACK_URL ??
  "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar";

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754 },
    executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    // The contract is built from owner/provider-entered text. It is escaped before it gets here,
    // and scripting is switched off as a second wall so nothing in it can ever execute in Chrome.
    await page.setJavaScriptEnabled(false);
    await page.setContent(html, { waitUntil: "load" });
    // "load" fires once the CSS resource itself resolves, but @font-face files download
    // asynchronously after that — without this, Arabic text can print in a fallback font.
    await page.evaluateHandle("document.fonts.ready");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
