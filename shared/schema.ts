import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

// Users model
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("owner"), // owner, provider
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = z.object({
  phone: z.string(),
  name: z.string().nullable().optional(),
  role: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Property model - المحدث بالكامل
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  building_type: text("building_type").notNull(), // residential, commercial
  address: text("address").notNull(),
  city: text("city").notNull(),
  units_count: integer("units_count").default(0),
  map_url: text("map_url"),
  national_address: text("national_address"),
  owner_id: uuid("owner_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = z.object({
  name: z.string(),
  building_type: z.string(),
  address: z.string(),
  city: z.string(),
  units_count: z.number().int().nullable().optional(),
  map_url: z.string().nullable().optional(),
  national_address: z.string().nullable().optional(),
  owner_id: z.string().uuid().optional(),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Request model
export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  owner_id: uuid("owner_id").notNull(),
  property_id: uuid("property_id").notNull(),
  service_category: text("service_category").notNull().default("standard"),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertRequestSchema = z.object({
  owner_id: z.string().uuid().optional(),
  property_id: z.string().uuid(),
  service_category: z.string().optional(),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;
