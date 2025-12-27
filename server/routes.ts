import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertServiceRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
      const data = insertServiceRequestSchema.parse(req.body);
      
      // Verify property exists
      const property = await storage.getProperty(data.propertyId);
      if (!property) {
        return res.status(400).json({ error: "Property not found" });
      }
      
      const request = await storage.createServiceRequest(data);
      res.status(201).json(request);
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
        status: z.enum(["open", "in_progress", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
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

  return httpServer;
}
