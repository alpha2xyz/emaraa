import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertPropertySchema, insertRequestSchema } from "../shared/schema.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY ?? "";

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
        return res.status(500).json({ error: "Failed to send OTP", detail: `${r.status}: ${body}` });
      }

      // Record this OTP attempt
      await supabaseAdmin.from("otp_rate_limits").insert([{ phone }]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[otp/send] exception:", err?.message);
      res.status(500).json({ error: "Failed to send OTP", detail: err?.message });
    }
  });

  // OTP — Verify SMS OTP via Authentica, create session
  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { phone, code, mode, role, name } = req.body;
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

      if (!r.ok) return res.status(400).json({ error: "Invalid OTP" });

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

      res.json({ token: session.token, userId, phone, role, name: userName });
    } catch (err: any) {
      console.error("[otp/verify] exception:", err?.message);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  return httpServer;
}
