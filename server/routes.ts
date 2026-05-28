import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { insertPropertySchema, insertRequestSchema } from "../shared/schema.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? "";
const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY ?? "";

function b64url(s: string): string {
  return Buffer.from(s)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signSupabaseJwt(sub: string, phone: string, role: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      aud: "authenticated",
      iss: `${SUPABASE_URL}/auth/v1`,
      sub,
      role: "authenticated",
      phone,
      app_metadata: { provider: "phone", providers: ["phone"], user_role: role },
      user_metadata: {},
      iat: now,
      exp: now + 30 * 24 * 3600,
    })
  );
  const sig = createHmac("sha256", SUPABASE_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${payload}.${sig}`;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const AUTHENTICA_BASE = "https://api.authentica.sa/api/v2";
const authenticaHeaders = {
  "X-Authorization": AUTHENTICA_API_KEY,
  Accept: "application/json",
  "Content-Type": "application/json",
};

// Middleware: validate session token from Authorization header
async function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token", token)
    .single();
  if (error || !data || new Date(data.expires_at) < new Date()) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  (req as any).userId = data.user_id;
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Session verification — used by RequireAuth.tsx (bypasses RLS via supabaseAdmin)
  app.get("/api/session/verify", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ valid: false });
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select("user_id, expires_at")
      .eq("token", token)
      .single();
    if (error || !data || new Date(data.expires_at) < new Date()) {
      return res.status(401).json({ valid: false });
    }
    // Return a fresh supabaseToken so clients always have a valid JWT for RLS
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("phone, role")
      .eq("id", data.user_id)
      .single();
    const supabaseToken =
      user && SUPABASE_JWT_SECRET ? signSupabaseJwt(data.user_id, user.phone, user.role) : "";
    res.json({ valid: true, userId: data.user_id, supabaseToken });
  });

  // Update current user's profile (name)
  app.put("/api/user/profile", requireSession, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: "name_required" });
      }
      const userId = (req as any).userId;
      const { error } = await supabaseAdmin
        .from("users")
        .update({ name: String(name).trim() })
        .eq("id", userId);
      if (error) throw error;
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? "update_failed" });
    }
  });

  // Admin login route — also creates session so client never calls Supabase directly
  app.post("/api/admin/login", async (req, res) => {
    try {
      const ip = req.ip || "unknown";
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count: attemptCount } = await supabaseAdmin
        .from("admin_login_attempts")
        .select("ip", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("created_at", fifteenMinAgo);
      if ((attemptCount ?? 0) >= 10) {
        return res.status(429).json({ error: "Too many attempts. Try again later." });
      }
      await supabaseAdmin.from("admin_login_attempts").insert([{ ip }]);

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      const { data, error } = await supabase.rpc("check_admin_login", {
        p_username: username.trim(),
        p_password: password,
      });
      if (error || !data?.[0]) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      const admin = data[0];
      const { data: token, error: tokenError } = await supabase.rpc("create_admin_session", {
        p_admin_id: admin.id,
      });
      if (tokenError || !token) {
        return res.status(500).json({ error: "Failed to create session" });
      }
      res.json({ id: admin.id, token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Properties routes (requireSession guards all data routes)
  app.get("/api/properties", requireSession, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("properties")
        .select("*")
        .eq("owner_id", (req as any).userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", requireSession, async (req, res) => {
    try {
      const { data: property, error } = await supabaseAdmin
        .from("properties")
        .select("*")
        .eq("id", req.params.id)
        .single();
      if (error || !property) return res.status(404).json({ error: "Property not found" });
      if (property.owner_id !== (req as any).userId)
        return res.status(403).json({ error: "Forbidden" });
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", requireSession, async (req, res) => {
    try {
      const { count: propertyCount } = await supabaseAdmin
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", (req as any).userId);
      if ((propertyCount ?? 0) >= 1) {
        return res.status(400).json({ error: "limit_reached" });
      }

      const data = insertPropertySchema.parse(req.body);
      data.owner_id = (req as any).userId;
      const { data: property, error } = await supabaseAdmin
        .from("properties")
        .insert([data])
        .select()
        .single();
      if (error || !property) throw error;
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid property data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", requireSession, async (req, res) => {
    try {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("properties")
        .select("owner_id")
        .eq("id", req.params.id)
        .single();
      if (fetchError || !existing) return res.status(404).json({ error: "Property not found" });
      if (existing.owner_id !== (req as any).userId)
        return res.status(403).json({ error: "Forbidden" });

      const updateSchema = z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        building_type: z.string().optional(),
        units_count: z.number().nullable().optional(),
        map_url: z.string().nullable().optional(),
        national_address: z.string().nullable().optional(),
      });
      const data = updateSchema.parse(req.body);
      const { data: updated, error } = await supabaseAdmin
        .from("properties")
        .update(data)
        .eq("id", req.params.id)
        .select()
        .single();
      if (error) throw error;
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid property data" });
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", requireSession, async (req, res) => {
    try {
      const { data: property, error: fetchError } = await supabaseAdmin
        .from("properties")
        .select("owner_id")
        .eq("id", req.params.id)
        .single();
      if (fetchError || !property) return res.status(404).json({ error: "Property not found" });
      if (property.owner_id !== (req as any).userId)
        return res.status(403).json({ error: "Forbidden" });

      await supabaseAdmin.from("requests").delete().eq("property_id", req.params.id);
      const { error } = await supabaseAdmin.from("properties").delete().eq("id", req.params.id);
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // Owner stats — dashboard summary
  app.get("/api/owner/stats", requireSession, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const [{ data: properties }, { data: requests }] = await Promise.all([
        supabaseAdmin.from("properties").select("*").eq("owner_id", userId),
        supabaseAdmin.from("requests").select("*").eq("owner_id", userId),
      ]);
      res.json({ properties: properties || [], requests: requests || [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Server-side file upload — receives raw file bytes, uploads via supabaseAdmin (no JWT needed)
  app.post(
    "/api/upload/provider-document",
    requireSession,
    (req, res, next) => {
      // Apply raw body parser only for this route to avoid breaking JSON routes
      // Limit matches server-side cap (10MB) with a small buffer for request overhead
      express.raw({ type: "*/*", limit: "11mb" })(req, res, next);
    },
    async (req, res) => {
      // --- (a) Folder whitelist ---
      const ALLOWED_FOLDERS = ["commercial-registers", "company-profiles", "fal-licenses"] as const;
      const folder = req.query.folder;
      if (typeof folder !== "string" || !(ALLOWED_FOLDERS as readonly string[]).includes(folder)) {
        return res.status(400).json({
          error:
            "Invalid or missing folder. Must be one of: commercial-registers, company-profiles, fal-licenses",
        });
      }

      // --- (b & c) File extension whitelist + filename sanitization ---
      const filename = req.query.filename;
      if (typeof filename !== "string") {
        return res.status(400).json({ error: "filename required" });
      }
      // Only allow: word chars, hyphens, then a whitelisted extension — no path separators
      const SAFE_FILENAME_RE = /^[\w\-]+\.(pdf|jpg|jpeg|png)$/i;
      if (!SAFE_FILENAME_RE.test(filename)) {
        return res.status(400).json({
          error:
            "Invalid filename. Only alphanumeric chars, underscores, hyphens, and extensions .pdf/.jpg/.jpeg/.png are allowed.",
        });
      }

      // --- (d) File size cap (10 MB) ---
      const MAX_BYTES = 10 * 1024 * 1024;
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: "Request body must be a non-empty file" });
      }
      if (req.body.length > MAX_BYTES) {
        return res.status(413).json({ error: "File exceeds maximum size of 10 MB" });
      }

      // --- (e) Magic bytes MIME check ---
      const ext = filename.split(".").pop()!.toLowerCase();
      const b = req.body;
      const isPdf = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46; // %PDF
      const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
      const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

      const magicMatches =
        (ext === "pdf" && isPdf) ||
        ((ext === "jpg" || ext === "jpeg") && isJpeg) ||
        (ext === "png" && isPng);

      if (!magicMatches) {
        return res.status(415).json({ error: "Invalid file type" });
      }

      // Derive content-type from validated extension — never trust the client header
      const CONTENT_TYPE_MAP: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
      };
      const contentType = CONTENT_TYPE_MAP[ext];

      // Scope path to the authenticated user — prevents one provider overwriting another's documents
      const userId = (req as any).userId as string;
      const { data, error } = await supabaseAdmin.storage
        .from("provider-documents")
        .upload(`${userId}/${folder}/${filename}`, req.body as Buffer, { contentType, upsert: true });
      if (error) return res.status(500).json({ error: error.message });
      res.json({ path: data.path });
    }
  );

  // Offer PDF upload — server-side via supabaseAdmin, PDF only
  app.post(
    "/api/upload/offer-document",
    requireSession,
    (req, res, next) => {
      express.raw({ type: "*/*", limit: "11mb" })(req, res, next);
    },
    async (req, res) => {
      const { filename } = req.query;
      if (!filename || typeof filename !== "string")
        return res.status(400).json({ error: "filename required" });
      if (!/^[\w\-]+\.pdf$/i.test(filename))
        return res.status(400).json({ error: "Invalid filename" });
      if (!Buffer.isBuffer(req.body) || req.body.length === 0)
        return res.status(400).json({ error: "Empty file" });
      if (req.body.length > 10 * 1024 * 1024)
        return res.status(413).json({ error: "File too large (max 10MB)" });
      const b = req.body;
      if (!(b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46)) {
        return res.status(415).json({ error: "Invalid file type — PDF required" });
      }
      const { data, error } = await supabaseAdmin.storage
        .from("provider-offers")
        .upload(filename, req.body as Buffer, { contentType: "application/pdf", upsert: false });
      if (error) return res.status(500).json({ error: error.message });
      res.json({ path: data.path });
    }
  );

  app.get("/api/provider/dashboard", requireSession, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const [{ data: user }, { data: provider }, { data: availableRequests }] = await Promise.all([
        supabaseAdmin.from("users").select("id, name, phone").eq("id", userId).single(),
        supabaseAdmin.from("providers").select("*").eq("user_id", userId).maybeSingle(),
        supabaseAdmin.from("requests").select("id").eq("status", "pending"),
      ]);
      const providerId = provider?.id ?? null;
      const { data: myOffers } = providerId
        ? await supabaseAdmin
            .from("provider_offers")
            .select("id, status")
            .eq("provider_id", providerId)
        : { data: [] };
      res.json({
        user: user || null,
        provider: provider || null,
        availableRequests: availableRequests || [],
        myOffers: myOffers || [],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider dashboard" });
    }
  });

  // Service Requests routes
  app.get("/api/requests", requireSession, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("requests")
        .select("*, properties(id, name, city)")
        .eq("owner_id", (req as any).userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/requests/:id", requireSession, async (req, res) => {
    try {
      const { data: request, error } = await supabaseAdmin
        .from("requests")
        .select("*")
        .eq("id", req.params.id)
        .single();
      if (error || !request) return res.status(404).json({ error: "Service request not found" });
      if (request.owner_id !== (req as any).userId)
        return res.status(403).json({ error: "Forbidden" });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service request" });
    }
  });

  app.post("/api/requests", requireSession, async (req, res) => {
    try {
      const { property_id } = req.body;
      if (!property_id) {
        return res.status(400).json({ error: "property_id is required" });
      }
      const { count: activeCount } = await supabaseAdmin
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", (req as any).userId)
        .eq("property_id", property_id)
        .neq("status", "closed");
      if ((activeCount ?? 0) >= 2) {
        return res.status(400).json({
          error: "active_requests_limit",
          messageAr: "لا يمكن إضافة أكثر من طلبين نشطين لنفس العقار",
          messageEn: "Cannot add more than 2 active requests for the same property",
        });
      }

      const data = insertRequestSchema.parse(req.body);
      data.owner_id = (req as any).userId;
      const { data: request, error } = await supabaseAdmin
        .from("requests")
        .insert([{ ...data, status: "pending" }])
        .select()
        .single();
      if (error || !request) throw error;
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create service request" });
    }
  });

  app.patch("/api/requests/:id", requireSession, async (req, res) => {
    try {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("requests")
        .select("owner_id")
        .eq("id", req.params.id)
        .single();
      if (fetchError || !existing)
        return res.status(404).json({ error: "Service request not found" });
      if (existing.owner_id !== (req as any).userId)
        return res.status(403).json({ error: "Forbidden" });

      const updateSchema = z.object({
        description: z.string().nullable().optional(),
        property_id: z.string().optional(),
        service_category: z.string().optional(),
      });
      const data = updateSchema.parse(req.body);
      const { data: updated, error } = await supabaseAdmin
        .from("requests")
        .update(data)
        .eq("id", req.params.id)
        .select()
        .single();
      if (error) throw error;
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update service request" });
    }
  });

  app.delete("/api/requests/:id", requireSession, async (req, res) => {
    try {
      const { data: request, error: fetchError } = await supabaseAdmin
        .from("requests")
        .select("owner_id")
        .eq("id", req.params.id)
        .single();
      if (fetchError || !request)
        return res.status(404).json({ error: "Service request not found" });
      if (request.owner_id !== (req as any).userId)
        return res.status(403).json({ error: "Forbidden" });

      const { error } = await supabaseAdmin.from("requests").delete().eq("id", req.params.id);
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service request" });
    }
  });

  // Offer status — accept or reject an offer (server-enforced ownership check)
  app.patch("/api/offers/:id/status", requireSession, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { data: offer, error: offerError } = await supabaseAdmin
        .from("provider_offers")
        .select("id, request_id")
        .eq("id", req.params.id as string)
        .single();
      if (offerError || !offer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      const { data: request, error: reqError } = await supabaseAdmin
        .from("requests")
        .select("owner_id")
        .eq("id", offer.request_id)
        .single();
      if (reqError || !request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.owner_id !== (req as any).userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { error: updateError } = await supabaseAdmin
        .from("provider_offers")
        .update({ status })
        .eq("id", req.params.id as string);
      if (updateError) throw updateError;

      if (status === "accepted") {
        await supabaseAdmin
          .from("requests")
          .update({ status: "in_progress" })
          .eq("id", offer.request_id);
        await supabaseAdmin
          .from("provider_offers")
          .update({ status: "rejected" })
          .eq("request_id", offer.request_id)
          .neq("id", req.params.id as string);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update offer status" });
    }
  });

  // Helper: send a plain SMS via Authentica (fire-and-forget)
  async function sendSms(phone: string, message: string) {
    const e164 = phone.startsWith("+") ? phone : "+966" + phone.substring(1);
    await fetch(`${AUTHENTICA_BASE}/send-sms`, {
      method: "POST",
      headers: authenticaHeaders,
      body: JSON.stringify({ phone: e164, message }),
    });
  }

  // SMS — notify provider (confirmation) + owner (new offer) after offer submitted
  app.post("/api/sms/offer-submitted", requireSession, async (req, res) => {
    try {
      const { offerId } = req.body;
      if (!offerId) return res.status(400).json({ error: "offerId required" });

      const { data: offer } = await supabaseAdmin
        .from("provider_offers")
        .select("id, request_id, provider_id, providers(user_id)")
        .eq("id", offerId)
        .single();
      if (!offer) return res.status(404).json({ error: "Offer not found" });

      const { data: request } = await supabaseAdmin
        .from("requests")
        .select("owner_id")
        .eq("id", offer.request_id)
        .single();

      // Notify provider — offer confirmed
      const providerUserId = (offer.providers as any)?.user_id;
      if (providerUserId) {
        const { data: pu } = await supabaseAdmin
          .from("users")
          .select("phone")
          .eq("id", providerUserId)
          .single();
        if (pu?.phone)
          sendSms(
            pu.phone,
            "تم إرسال عرضك بنجاح على عِماره. سنُعلمك فور قبوله من قِبل المالك."
          ).catch(() => {});
      }

      // Notify owner — new offer arrived
      if (request?.owner_id) {
        const { data: ou } = await supabaseAdmin
          .from("users")
          .select("phone")
          .eq("id", request.owner_id)
          .single();
        if (ou?.phone)
          sendSms(
            ou.phone,
            "لديك عرض جديد على طلبك في عِماره. سجّل دخولك لمراجعته: emaraa.vercel.app"
          ).catch(() => {});
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed" });
    }
  });

  // SMS — notify all approved Riyadh providers when a new request is posted
  app.post("/api/sms/new-request", requireSession, async (req, res) => {
    try {
      const { requestId } = req.body;
      if (!requestId) return res.status(400).json({ error: "requestId required" });

      const { data: providers } = await supabaseAdmin
        .from("providers")
        .select("user_id")
        .eq("approved", true)
        .eq("city", "الرياض");

      if (providers?.length) {
        for (const p of providers) {
          const { data: u } = await supabaseAdmin
            .from("users")
            .select("phone")
            .eq("id", p.user_id)
            .single();
          if (u?.phone)
            sendSms(
              u.phone,
              "طلب خدمة جديد في الرياض! سجّل دخولك على عِماره لتقديم عرضك: emaraa.vercel.app"
            ).catch(() => {});
        }
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed" });
    }
  });

  // OTP — Send SMS OTP via Authentica
  app.post("/api/otp/send", async (req, res) => {
    try {
      const { phone, mode } = req.body;
      if (!phone || !/^05\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      // Whitelist mode — reject anything that isn't login or register to prevent SMS abuse
      if (mode !== "login" && mode !== "register") {
        return res.status(400).json({ error: "Invalid mode. Must be 'login' or 'register'" });
      }

      // Check phone existence BEFORE sending OTP (saves SMS credit + gives instant feedback)
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (mode === "login" && !existingUser) {
        return res.status(404).json({ error: "Phone not registered" });
      }
      if (mode === "register" && existingUser) {
        return res.status(409).json({ error: "Phone already registered" });
      }

      // Bypass mode: skip Authentica — accept any 4-digit code for testing
      if (process.env.OTP_BYPASS === "true") {
        return res.json({ success: true, bypass: true });
      }

      // Rate limit: max 3 OTPs per phone per 10 minutes
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("otp_rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("phone", phone)
        .gte("created_at", tenMinAgo);
      if ((count ?? 0) >= 3) {
        return res.status(429).json({ error: "Too many OTP requests. Please wait 10 minutes." });
      }

      const e164 = "+966" + phone.substring(1);
      const r = await fetch(`${AUTHENTICA_BASE}/send-otp`, {
        method: "POST",
        headers: authenticaHeaders,
        body: JSON.stringify({ method: "sms", phone: e164 }),
      });

      if (!r.ok) {
        const body = await r.text();
        console.error("[otp/send] Authentica error:", r.status, body);
        return res.status(500).json({ error: "Failed to send verification code" });
      }

      // Record this OTP attempt
      await supabaseAdmin.from("otp_rate_limits").insert([{ phone }]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[otp/send] exception:", err?.message);
      res.status(500).json({ error: "Failed to send verification code" });
    }
  });

  // OTP — Verify SMS OTP via Authentica, create session
  app.post("/api/otp/verify", async (req, res) => {
    try {
      const phone = req.body.phone as string;
      if (!phone || !/^05\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      // Rate limit: max 5 OTP verify attempts per phone per 15 minutes (DB-backed, survives cold starts)
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count: verifyCount } = await supabaseAdmin
        .from("otp_rate_limits")
        .select("phone", { count: "exact", head: true })
        .eq("phone", phone)
        .gte("created_at", fifteenMinAgo);
      if ((verifyCount ?? 0) >= 5) {
        return res.status(429).json({ error: "Too many attempts. Try again later." });
      }

      const { code, mode, role, name } = req.body;
      if (!phone || !code || !mode || !role) {
        return res.status(400).json({ error: "Phone, code, mode, and role are required" });
      }
      if (!["owner", "provider"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Bypass mode: accept any 4-digit code without calling Authentica
      if (process.env.OTP_BYPASS !== "true") {
        const e164 = "+966" + phone.substring(1);
        const r = await fetch(`${AUTHENTICA_BASE}/verify-otp`, {
          method: "POST",
          headers: authenticaHeaders,
          body: JSON.stringify({ phone: e164, otp: code }),
        });

        if (!r.ok) {
          // Record failed verify attempt in DB so rate limit persists across cold starts
          await supabaseAdmin.from("otp_rate_limits").insert([{ phone }]);
          return res.status(400).json({ error: "Invalid OTP" });
        }
      }

      // OTP verified — create or find user
      let userId: string;
      let userName = "";

      if (mode === "register") {
        const { data: existing } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("phone", phone)
          .maybeSingle();

        if (existing) {
          return res.status(409).json({ error: "Phone already registered" });
        }

        const { data: newUser, error: insertError } = await supabaseAdmin
          .from("users")
          .insert([{ phone, name: name?.trim() ?? null, role }])
          .select("id, name")
          .single();

        if (insertError || !newUser) {
          console.error("[otp/verify] user insert error:", insertError);
          return res.status(500).json({ error: "Failed to create user" });
        }
        userId = newUser.id;
        userName = newUser.name ?? "";
      } else {
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id, name")
          .eq("phone", phone)
          .eq("role", role)
          .maybeSingle();

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        userId = user.id;
        userName = user.name ?? "";
      }

      // Create session (30-day expiry) via service role to bypass RLS
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("sessions")
        .insert([{ user_id: userId, expires_at: expiresAt.toISOString() }])
        .select("token")
        .single();

      if (sessionError || !session) {
        console.error("[otp/verify] session insert error:", sessionError);
        return res.status(500).json({ error: "Failed to create session" });
      }

      const supabaseToken = SUPABASE_JWT_SECRET ? signSupabaseJwt(userId, phone, role) : "";
      res.json({ token: session.token, userId, phone, role, name: userName, supabaseToken });
    } catch (err: any) {
      console.error("[otp/verify] exception:", err?.message);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Admin impersonation — creates a real session for any user. Requires valid admin session token.
  app.post("/api/admin/impersonate", async (req, res) => {
    const adminToken = req.headers.authorization?.replace("Bearer ", "").trim();
    if (!adminToken) return res.status(401).json({ error: "Unauthorized" });

    const { data: isValid } = await supabase.rpc("verify_admin_session", { p_token: adminToken });
    if (!isValid) return res.status(401).json({ error: "Invalid admin session" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, name, phone, role")
      .eq("id", userId)
      .single();
    if (!user) return res.status(404).json({ error: "User not found" });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .insert([{ user_id: user.id, expires_at: expiresAt.toISOString() }])
      .select("token")
      .single();

    if (sessionError || !session)
      return res.status(500).json({ error: "Failed to create session" });

    const supabaseToken = SUPABASE_JWT_SECRET
      ? signSupabaseJwt(user.id, user.phone, user.role)
      : "";
    res.json({
      token: session.token,
      userId: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name ?? "",
      supabaseToken,
    });
  });

  // Approve or reject a provider. Sends SMS to provider on approval.
  app.post("/api/admin/approve-provider", async (req, res) => {
    try {
      const adminToken = req.headers.authorization?.replace("Bearer ", "").trim();
      if (!adminToken) return res.status(401).json({ error: "Unauthorized" });

      const { data: isValid } = await supabase.rpc("verify_admin_session", { p_token: adminToken });
      if (!isValid) return res.status(401).json({ error: "Invalid admin session" });

      const { id, approved } = req.body;
      if (!id || typeof approved !== "boolean") {
        return res.status(400).json({ error: "id and approved required" });
      }

      const { error } = await supabaseAdmin.from("providers").update({ approved }).eq("id", id);
      if (error) throw error;

      if (approved) {
        const { data: provider } = await supabaseAdmin
          .from("providers")
          .select("user_id")
          .eq("id", id)
          .single();
        if (provider?.user_id) {
          const { data: u } = await supabaseAdmin
            .from("users")
            .select("phone")
            .eq("id", provider.user_id)
            .single();
          if (u?.phone)
            sendSms(
              u.phone,
              "تهانينا! تم قبول حسابك في عِماره. يمكنك الآن تقديم عروضك على طلبات الخدمة: emaraa.vercel.app"
            ).catch(() => {});
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update provider approval" });
    }
  });

  // Bootstrap endpoint — only allowed when zero admins exist (first-time setup only).
  app.post("/api/admin/create", async (req, res) => {
    try {
      const { count: adminCount } = await supabaseAdmin
        .from("admins")
        .select("id", { count: "exact", head: true });
      if ((adminCount ?? 0) > 0) {
        return res.status(403).json({
          error:
            "Admin already exists. Use ADMIN_USERNAME/ADMIN_PASSWORD env vars to manage admins.",
        });
      }

      const { username, password } = req.body;
      if (!username || typeof username !== "string" || !username.trim()) {
        return res.status(400).json({ error: "Username is required" });
      }
      if (!password || typeof password !== "string" || !password.trim()) {
        return res.status(400).json({ error: "Password is required" });
      }
      if (password.length < 12) {
        return res.status(400).json({ error: "password_too_short" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const { error: insertError } = await supabaseAdmin
        .from("admins")
        .insert([{ username: username.trim(), password: hashedPassword }]);

      if (insertError) {
        console.error("[admin/create] insert error:", insertError);
        return res.status(500).json({ error: "Failed to create admin" });
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("[admin/create] exception:", err?.message);
      res.status(500).json({ error: "Failed to create admin" });
    }
  });

  // ── Admin data endpoints (all use supabaseAdmin to bypass RLS) ──────────────

  async function verifyAdminToken(req: Request, res: Response): Promise<boolean> {
    const adminToken = req.headers.authorization?.replace("Bearer ", "").trim();
    if (!adminToken) {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }
    const { data: isValid } = await supabase.rpc("verify_admin_session", { p_token: adminToken });
    if (!isValid) {
      res.status(401).json({ error: "Invalid admin session" });
      return false;
    }
    return true;
  }

  app.get("/api/admin/stats", async (req, res) => {
    if (!(await verifyAdminToken(req, res))) return;
    const [owners, properties, requests, providers] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "owner"),
      supabaseAdmin.from("properties").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("requests").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "provider"),
    ]);
    res.json({
      users: owners.count ?? 0,
      properties: properties.count ?? 0,
      requests: requests.count ?? 0,
      providers: providers.count ?? 0,
    });
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!(await verifyAdminToken(req, res))) return;
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, name, phone, role, created_at")
      .eq("role", "owner")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch users" });
    res.json(data ?? []);
  });

  app.get("/api/admin/providers", async (req, res) => {
    if (!(await verifyAdminToken(req, res))) return;
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, name, phone, created_at, providers(id, company_name, city, approved, commercial_register_url, company_profile_url, fal_license_url, description)"
      )
      .eq("role", "provider")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch providers" });
    res.json(data ?? []);
  });

  app.get("/api/admin/properties", async (req, res) => {
    if (!(await verifyAdminToken(req, res))) return;
    const { data, error } = await supabaseAdmin
      .from("properties")
      .select(
        "id, name, city, address, national_address, building_type, units_count, created_at, users(name, phone)"
      )
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch properties" });
    res.json(data ?? []);
  });

  app.get("/api/admin/requests", async (req, res) => {
    if (!(await verifyAdminToken(req, res))) return;
    const { data, error } = await supabaseAdmin
      .from("requests")
      .select(
        "id, service_category, status, created_at, description, properties(name, city, users(name, phone)), provider_offers(id, status, offer_file_url, notes, price_total, providers(company_name, city))"
      )
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch requests" });
    res.json(data ?? []);
  });

  return httpServer;
}

// Seed admin from env vars on startup. Upserts by username, only re-hashes if password changed.
export async function seedAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!username || !password) return;

  try {
    const { data: existing } = await supabaseAdmin
      .from("admins")
      .select("id, password")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      const matches = await bcrypt.compare(password, existing.password);
      if (!matches) {
        const newHash = await bcrypt.hash(password, 12);
        await supabaseAdmin.from("admins").update({ password: newHash }).eq("id", existing.id);
        console.log("[seedAdmin] password updated for", username);
      }
    } else {
      const hash = await bcrypt.hash(password, 12);
      const { error } = await supabaseAdmin
        .from("admins")
        .insert([{ username, password: hash }]);
      if (error) {
        console.error("[seedAdmin] insert error:", error.message);
      } else {
        console.log("[seedAdmin] admin created:", username);
      }
    }
  } catch (err: any) {
    console.error("[seedAdmin] exception:", err?.message);
  }
}
