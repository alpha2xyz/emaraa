import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertRequestSchema } from "../shared/schema";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AUTHENTICA_BASE = "https://api.authentica.sa/api/v2";
const authenticaHeaders = {
  "X-Authorization": AUTHENTICA_API_KEY,
  "Accept": "application/json",
  "Content-Type": "application/json",
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Admin login route
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
      res.json(data[0]);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
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

  app.post("/api/properties", async (req, res) => {
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

  app.delete("/api/properties/:id", async (req, res) => {
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
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
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

  app.post("/api/requests", async (req, res) => {
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

  app.patch("/api/requests/:id", async (req, res) => {
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

  app.delete("/api/requests/:id", async (req, res) => {
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

      const e164 = "+966" + phone.substring(1);
      const r = await fetch(`${AUTHENTICA_BASE}/send-otp`, {
        method: "POST",
        headers: authenticaHeaders,
        body: JSON.stringify({ method: "sms", phone: e164 }),
      });

      if (!r.ok) return res.status(500).json({ error: "Failed to send OTP" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // OTP — Verify SMS OTP via Authentica
  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ error: "Phone and code required" });
      }

      const e164 = "+966" + phone.substring(1);
      const r = await fetch(`${AUTHENTICA_BASE}/verify-otp`, {
        method: "POST",
        headers: authenticaHeaders,
        body: JSON.stringify({ phone: e164, otp: code }),
      });

      if (!r.ok) return res.status(400).json({ error: "Invalid OTP" });
      res.json({ valid: true });
    } catch (err) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  return httpServer;
}
