/**
 * Storage path ownership validation.
 *
 * The upload endpoints scope every file they write to its owner:
 *   provider-documents → `${userId}/${folder}/${filename}`
 *   provider-offers    → `${providerId}_${requestId}_${timestamp}.pdf`
 *
 * But the routes that PERSIST those paths (POST /api/provider/profile and
 * POST /api/provider/offers) took whatever string the browser sent, and
 * GET /api/files/signed-url then derives "who owns this file" by matching the
 * stored value. So a provider who knew or guessed another provider's path could
 * store it on their own row and have the signed-url endpoint hand it to them —
 * the access check would agree, because the row really did say so.
 *
 * These helpers close that by rejecting any path that isn't shaped like one the
 * caller could legitimately have produced. Reported in master plan v1006
 * (engineering item #1).
 */

/**
 * Paths that could escape their prefix or smuggle a second path in.
 *
 * storage-js puts the path into the request URL unencoded, so `?` and `#` cut the URL short and
 * `..` (also as `%2e%2e`) is collapsed by the HTTP client into a different bucket. Control
 * characters have no place in a file name either.
 */
function hasTraversal(path: string): boolean {
  return (
    path.includes("..") ||
    path.includes("\\") ||
    path.includes("?") ||
    path.includes("#") ||
    path.startsWith("/") ||
    /[\u0000-\u001f\u007f]/.test(path) ||
    /%(2e|2f|5c)/i.test(path)
  );
}

const CONTRACT_PATH_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(unsigned|sealed)-\d+\.pdf$/i;
const MAX_SIGNED_URL_PATH = 300;

/**
 * GET /api/files/signed-url: the path is checked before any bucket-specific access rule, so it
 * also covers admin sessions, which skip those rules. Contracts are only ever written as
 * `${dealId}/unsigned-${ms}.pdf` and `${dealId}/sealed-${ms}.pdf`, so that is the only shape
 * accepted there.
 * Returns null when valid, or an error string.
 */
export function checkSignedUrlPath(bucket: string, path: string): string | null {
  if (path.length > MAX_SIGNED_URL_PATH || hasTraversal(path)) return "Invalid path";
  if (bucket === "contracts" && !CONTRACT_PATH_RE.test(path)) return "Invalid path";
  return null;
}

/**
 * provider-documents: must live under the caller's own `${userId}/` folder.
 * Returns null when valid, or an error string.
 */
export function checkDocumentPath(userId: string, path: string): string | null {
  if (hasTraversal(path)) return "Invalid document path";
  if (!path.startsWith(`${userId}/`)) return "Invalid document path — owner mismatch";
  return null;
}

/**
 * provider-offers: flat bucket, so ownership lives in the filename prefix the
 * upload route enforces (`${providerId}_...`).
 * Returns null when valid, or an error string.
 */
export function checkOfferPath(providerId: string, path: string): string | null {
  if (hasTraversal(path)) return "Invalid offer path";
  if (path.includes("/")) return "Invalid offer path";
  if (!path.startsWith(`${providerId}_`)) return "Invalid offer path — provider mismatch";
  return null;
}

/**
 * Validates the three provider document URLs in one call. Only checks fields that
 * are actually present and non-empty: `undefined` means "leave unchanged" to the
 * update path, and must not be treated as a violation.
 * Returns null when all supplied paths are valid, or the first error string.
 */
export function checkProviderDocumentPaths(
  userId: string,
  paths: {
    commercial_register_url?: string | null;
    company_profile_url?: string | null;
    fal_license_url?: string | null;
  }
): string | null {
  for (const value of [
    paths.commercial_register_url,
    paths.company_profile_url,
    paths.fal_license_url,
  ]) {
    if (typeof value === "string" && value.length > 0) {
      const err = checkDocumentPath(userId, value);
      if (err) return err;
    }
  }
  return null;
}
