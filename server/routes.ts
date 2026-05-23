import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
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
  return Buffer.from(s).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signSupabaseJwt(sub: string, phone: string, role: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({
    aud: "authenticated", iss: `${SUPABASE_URL}/auth/v1`,
    sub, role: "authenticated", phone,
    app_metadata: { provider: "phone", providers: ["phone"], user_role: role },
    user_metadata: {}, iat: now, exp: now + 30 * 24 * 3600,
  }));
  const sig = createHmac("sha256", SUPABASE_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${header}.${payload}.${sig}`;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const AUTHENTICA_BASE = "https://api.authentica.sa/api/v2";
const authenticaHeaders = {
  "X-Authorization": AUTHENTICA_API_KEY,
  "Accept": "application/json",
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
    const supabaseToken = (user && SUPABASE_JWT_SECRET)
      ? signSupabaseJwt(data.user_id, user.phone, user.role)
      : "";
    res.json({ valid: true, userId: data.user_id, supabaseToken });
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
      const { data, error } = await supabase.rpc('check_admin_login', {
        p_username: username.trim(),
        p_password: password,
      });
      if (error || !data?.[0]) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      const admin = data[0];
      const { data: token, error: tokenError } = await supabase
        .rpc('create_admin_session', { p_admin_id: admin.id });
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
      if (property.owner_id !== (req as any).userId) return res.status(403).json({ error: "Forbidden" });
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
      if (existing.owner_id !== (req as any).userId) return res.status(403).json({ error: "Forbidden" });

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
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid property data" });
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
      if (property.owner_id !== (req as any).userId) return res.status(403).json({ error: "Forbidden" });

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
        ? await supabaseAdmin.from("provider_offers").select("id, status").eq("provider_id", providerId)
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
      if (request.owner_id !== (req as any).userId) return res.status(403).json({ error: "Forbidden" });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service request" });
    }
  });

  app.post("/api/requests", requireSession, async (req, res) => {
    try {
      const { count: acceptedCount } = await supabaseAdmin
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", (req as any).userId)
        .eq("status", "accepted");
      if ((acceptedCount ?? 0) >= 1) {
        return res.status(400).json({ error: "accepted_exists" });
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
      if (fetchError || !existing) return res.status(404).json({ error: "Service request not found" });
      if (existing.owner_id !== (req as any).userId) return res.status(403).json({ error: "Forbidden" });

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
      if (fetchError || !request) return res.status(404).json({ error: "Service request not found" });
      if (request.owner_id !== (req as any).userId) return res.status(403).json({ error: "Forbidden" });

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
        .eq("id", (req.params.id as string))
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
        .eq("id", (req.params.id as string));
      if (updateError) throw updateError;

      if (status === "accepted") {
        await supabaseAdmin.from("requests").update({ status: "in_progress" }).eq("id", offer.request_id);
        await supabaseAdmin.from("provider_offers")
          .update({ status: "rejected" })
          .eq("request_id", offer.request_id)
          .neq("id", (req.params.id as string));
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
        const { data: pu } = await supabaseAdmin.from("users").select("phone").eq("id", providerUserId).single();
        if (pu?.phone) sendSms(pu.phone, "تم إرسال عرضك بنجاح على عِماره. سنُعلمك فور قبوله من قِبل المالك.").catch(() => {});
      }

      // Notify owner — new offer arrived
      if (request?.owner_id) {
        const { data: ou } = await supabaseAdmin.from("users").select("phone").eq("id", request.owner_id).single();
        if (ou?.phone) sendSms(ou.phone, "لديك عرض جديد على طلبك في عِماره. سجّل دخولك لمراجعته: emaraa.vercel.app").catch(() => {});
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
          const { data: u } = await supabaseAdmin.from("users").select("phone").eq("id", p.user_id).single();
          if (u?.phone) sendSms(u.phone, "طلب خدمة جديد في الرياض! سجّل دخولك على عِماره لتقديم عرضك: emaraa.vercel.app").catch(() => {});
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
      const { phone } = req.body;
      if (!phone || !/^05\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number" });
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
      .from("users").select("id, name, phone, role").eq("id", userId).single();
    if (!user) return res.status(404).json({ error: "User not found" });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .insert([{ user_id: user.id, expires_at: expiresAt.toISOString() }])
      .select("token").single();

    if (sessionError || !session) return res.status(500).json({ error: "Failed to create session" });

    const supabaseToken = SUPABASE_JWT_SECRET ? signSupabaseJwt(user.id, user.phone, user.role) : "";
    res.json({ token: session.token, userId: user.id, phone: user.phone, role: user.role, name: user.name ?? "", supabaseToken });
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
          const { data: u } = await supabaseAdmin.from("users").select("phone").eq("id", provider.user_id).single();
          if (u?.phone) sendSms(u.phone, "تهانينا! تم قبول حسابك في عِماره. يمكنك الآن تقديم عروضك على طلبات الخدمة: emaraa.vercel.app").catch(() => {});
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update provider approval" });
    }
  });

  // Create a new admin account. Requires a valid admin session token.
  app.post("/api/admin/create", async (req, res) => {
    try {
      const adminToken = req.headers.authorization?.replace("Bearer ", "").trim();
      if (!adminToken) return res.status(401).json({ error: "Unauthorized" });

      const { data: isValid } = await supabase.rpc("verify_admin_session", { p_token: adminToken });
      if (!isValid) return res.status(401).json({ error: "Invalid admin session" });

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

      // Check for duplicate username
      const { data: existing } = await supabase
        .from("admins")
        .select("id")
        .eq("username", username.trim())
        .maybeSingle();
      if (existing) {
        return res.status(400).json({ error: "username_taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const { error: insertError } = await supabaseAdmin
        .from("admins")
        .insert([{ username: username.trim(), password_hash: hashedPassword }]);

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
    if (!adminToken) { res.status(401).json({ error: "Unauthorized" }); return false; }
    const { data: isValid } = await supabase.rpc("verify_admin_session", { p_token: adminToken });
    if (!isValid) { res.status(401).json({ error: "Invalid admin session" }); return false; }
    return true;
  }

  app.get("/api/admin/stats", async (req, res) => {
    if (!await verifyAdminToken(req, res)) return;
    const [users, properties, requests, providers] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("properties").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("requests").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("providers").select("id", { count: "exact", head: true }),
    ]);
    res.json({ users: users.count ?? 0, properties: properties.count ?? 0, requests: requests.count ?? 0, providers: providers.count ?? 0 });
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!await verifyAdminToken(req, res)) return;
    const { data, error } = await supabaseAdmin
      .from("users").select("id, name, phone, role, created_at").eq("role", "owner")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch users" });
    res.json(data ?? []);
  });

  app.get("/api/admin/providers", async (req, res) => {
    if (!await verifyAdminToken(req, res)) return;
    const { data, error } = await supabaseAdmin
      .from("providers")
      .select("id, user_id, company_name, city, approved, created_at, commercial_register_url, company_profile_url, fal_license_url, description, bank_name, iban, users(name, phone)")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch providers" });
    res.json(data ?? []);
  });

  app.get("/api/admin/properties", async (req, res) => {
    if (!await verifyAdminToken(req, res)) return;
    const { data, error } = await supabaseAdmin
      .from("properties")
      .select("id, name, city, address, national_address, building_type, units_count, created_at, users(name, phone)")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch properties" });
    res.json(data ?? []);
  });

  app.get("/api/admin/requests", async (req, res) => {
    if (!await verifyAdminToken(req, res)) return;
    const { data, error } = await supabaseAdmin
      .from("requests")
      .select("id, service_category, status, created_at, description, properties(name, city, users(name, phone)), provider_offers(id, status, offer_file_url, notes, price_total, providers(company_name, city))")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Failed to fetch requests" });
    res.json(data ?? []);
  });

  return httpServer;
}
