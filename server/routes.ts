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
  const { data, error } = await supabase
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
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", requireSession, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", requireSession, async (req, res) => {
    try {
      // Server-side 1-property-per-owner limit
      const { count: propertyCount } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", (req as any).userId);
      if ((propertyCount ?? 0) >= 1) {
        return res.status(400).json({ error: "limit_reached" });
      }

      const data = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(data);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid property data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.delete("/api/properties/:id", requireSession, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      if (property.owner_id !== (req as any).userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Delete associated service requests
      await storage.deleteServiceRequestsByProperty(req.params.id);
      await storage.deleteProperty(req.params.id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // Service Requests routes
  app.get("/api/requests", requireSession, async (req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/requests/:id", requireSession, async (req, res) => {
    try {
      const request = await storage.getServiceRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Service request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service request" });
    }
  });

  app.post("/api/requests", requireSession, async (req, res) => {
    try {
      // Block new request if owner already has an accepted offer
      const { count: acceptedCount } = await supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", (req as any).userId)
        .eq("status", "accepted");
      if ((acceptedCount ?? 0) >= 1) {
        return res.status(400).json({ error: "accepted_exists" });
      }

      const data = insertRequestSchema.parse(req.body);
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create service request" });
    }
  });

  app.patch("/api/requests/:id", requireSession, async (req, res) => {
    try {
      const existing = await storage.getServiceRequest(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Service request not found" });
      }

      const updateSchema = z.object({
        status: z.string().optional(),
        description: z.string().optional(),
        service_category: z.string().optional(),
      });

      const data = updateSchema.parse(req.body);
      const updated = await storage.updateServiceRequest(req.params.id, data);
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
      const request = await storage.getServiceRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Service request not found" });
      }
      if (request.owner_id !== (req as any).userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteServiceRequest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service request" });
    }
  });

  // OTP — Send SMS OTP via Authentica
  app.post("/api/otp/send", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone || !/^05\d{8}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number" });
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

      // OTP verified — create or find user
      let userId: string;
      let userName = "";

      if (mode === "register") {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("phone", phone)
          .maybeSingle();

        if (existing) {
          return res.status(409).json({ error: "Phone already registered" });
        }

        const { data: newUser, error: insertError } = await supabase
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
        const { data: user } = await supabase
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

  return httpServer;
}
