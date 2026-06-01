import { toast } from "@/hooks/use-toast";

// Opens a private storage file in a new tab. The signed URL is generated
// server-side via supabaseAdmin, so it does not depend on the client JWT or
// storage RLS (which previously caused "Could not open file" failures).
export async function openSignedPdf(bucket: string, storagePath: string) {
  const token =
    localStorage.getItem("sessionToken") || localStorage.getItem("adminSessionToken");
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
