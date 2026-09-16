// Turns the contract's anchor tags into page coordinates.
//
// Why this exists: _work/esign-workflow-spec-v1.md §3 requires signature fields to be placed by
// anchor tag on the contract's own signature lines, never by x/y — a fixed coordinate silently
// drifts whenever the template's layout changes. Signit implements anchor search itself, so
// signit-adapter.ts just passes the tag through. SADQ's API only accepts x/y/page
// (positionX/positionY/pageNumber on /api/v3/invitations/send), so the anchor search has to
// happen on our side.
//
// It runs against the PDF we just rendered, not against the HTML: reading the finished document
// is the only way to know where Chrome's pagination actually put the signature table. A template
// change moves the anchor and this moves with it; if the anchor text disappears, this throws
// instead of placing a signature box in the wrong place.

import type { Buffer } from "node:buffer";

export type AnchorBox = {
  /** 1-based page number, as SADQ's pageNumber expects. */
  page: number;
  /** PDF points from the page's left edge. */
  x: number;
  /** PDF points from the page's TOP edge to the anchor text's baseline. Verified 2026-09-16:
   *  SADQ's positionY is measured from the top, not the PDF-native bottom (see
   *  _work/sadq-api-integration-brief-v1.md finding #4). */
  baselineFromTop: number;
  /** Advance width of the anchor text, used to centre a field on it. */
  width: number;
  pageWidth: number;
  pageHeight: number;
};

/**
 * Finds each tag in the rendered PDF and returns where it landed.
 *
 * Text is matched against the whole page's concatenated text rather than item by item, because a
 * PDF producer is free to split one visual word across several text items — the tags are single
 * words today but nothing guarantees that after a font or template change.
 */
export async function locateAnchors(
  pdfBuffer: Buffer,
  tags: string[],
): Promise<Record<string, AnchorBox>> {
  // Legacy build: the modern one assumes a browser-ish environment. Dynamic import keeps pdfjs
  // out of the module graph of every request that never renders a contract.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    // Text positions only — no rendering, so none of the font machinery is needed. isEvalSupported
    // off because this parses a document we generated but should still never eval from it.
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;

  const found: Record<string, AnchorBox> = {};

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();

      // Build the page's text plus, for every character, which item it came from.
      let pageText = "";
      const itemAt: number[] = [];
      const items = content.items as any[];
      for (let i = 0; i < items.length; i++) {
        const str: string = items[i].str ?? "";
        for (let c = 0; c < str.length; c++) itemAt.push(i);
        pageText += str;
      }

      for (const tag of tags) {
        if (found[tag]) continue;
        const at = pageText.indexOf(tag);
        if (at < 0) continue;

        const item = items[itemAt[at]];
        const [x, yFromTop] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        found[tag] = {
          page: pageNumber,
          x,
          baselineFromTop: yFromTop,
          width: item.width ?? 0,
          pageWidth: viewport.width,
          pageHeight: viewport.height,
        };
      }
    }
  } finally {
    await doc.destroy();
  }

  const missing = tags.filter((t) => !found[t]);
  if (missing.length > 0) {
    // Loud on purpose. A missing anchor means the contract template and this code have drifted
    // apart, and the only alternatives are a signature box at a guessed position or a silent skip.
    throw new Error(
      `Anchor tag(s) not found in the rendered contract: ${missing.join(", ")}. ` +
        "The contract template's signature markers changed — see server/esign/contract-template.ts.",
    );
  }

  return found;
}

/**
 * Converts an anchor into the signature-field rectangle to send to the vendor: a box of the given
 * size, centred horizontally on the anchor text and sitting directly above its baseline, so the
 * signature covers the «التوقيع هنا» line it belongs to. Clamped to the page.
 */
export function fieldBoxFromAnchor(
  anchor: AnchorBox,
  width: number,
  height: number,
): { x: number; y: number; width: number; height: number; page: number } {
  const centre = anchor.x + anchor.width / 2;
  // +2pt so the box bottom clears the anchor text's descenders instead of cutting through them.
  const bottom = anchor.baselineFromTop + 2;
  const x = clamp(centre - width / 2, 0, Math.max(0, anchor.pageWidth - width));
  const y = clamp(bottom - height, 0, Math.max(0, anchor.pageHeight - height));
  return { x, y, width, height, page: anchor.page };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
