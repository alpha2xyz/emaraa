import { toast } from "@/hooks/use-toast";

// Opens a private storage file in a new tab. The signed URL is generated
// server-side via supabaseAdmin, so it does not depend on the client JWT or
// storage RLS (which previously caused "Could not open file" failures).
//
// Pass `targetWindow` when the caller already has a window handle opened
// synchronously inside the original click (e.g. `window.open("about:blank", "_blank")`
// before an await). Browsers only allow window.open to bypass the popup blocker within
// a user gesture; this function itself does one await (the signed-url fetch) before it
// would otherwise call window.open, and a caller one hop further out (like a mutation's
// onSuccess) adds another — two awaited round-trips is enough for Chrome to no longer
// treat the eventual window.open as gesture-triggered, so it silently blocks it. Reusing
// a window opened synchronously at the true click sidesteps that entirely.
export async function openSignedPdf(
  bucket: string,
  storagePath: string,
  opts?: { admin?: boolean; targetWindow?: Window | null }
) {
  // On admin pages pass { admin: true } so we send the admin session token.
  // Otherwise (incl. an admin impersonating a user) we send the user session token.
  // This stops a leftover user `sessionToken` from shadowing the admin identity,
  // which the owner-scoped /api/files/signed-url endpoint would reject with 403.
  const token = opts?.admin
    ? localStorage.getItem("adminSessionToken") || localStorage.getItem("sessionToken")
    : localStorage.getItem("sessionToken") || localStorage.getItem("adminSessionToken");
  try {
    const res = await fetch(
      `/api/files/signed-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(storagePath)}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    if (!res.ok) throw new Error("sign_failed");
    const { url } = await res.json();
    if (!url) throw new Error("no_url");
    if (opts?.targetWindow && !opts.targetWindow.closed) {
      opts.targetWindow.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  } catch {
    if (opts?.targetWindow && !opts.targetWindow.closed) opts.targetWindow.close();
    toast({
      title: "تعذّر فتح الملف",
      description: "Could not open file. Please try again.",
      variant: "destructive",
    });
  }
}
