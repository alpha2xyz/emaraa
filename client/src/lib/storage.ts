import { toast } from "@/hooks/use-toast";

// Opens a private storage file in a new tab. The signed URL is generated
// server-side via supabaseAdmin, so it does not depend on the client JWT or
// storage RLS (which previously caused "Could not open file" failures).
export async function openSignedPdf(
  bucket: string,
  storagePath: string,
  opts?: { admin?: boolean }
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
    window.open(url, "_blank");
  } catch {
    toast({
      title: "تعذّر فتح الملف",
      description: "Could not open file. Please try again.",
      variant: "destructive",
    });
  }
}
