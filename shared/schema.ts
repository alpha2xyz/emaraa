import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, uuid, boolean, numeric } from "drizzle-orm/pg-core";
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

// Providers model
export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  company_name: text("company_name").notNull(),
  email: text("email"),
  city: text("city"),
  description: text("description"),
  commercial_register_url: text("commercial_register_url"),
  company_profile_url: text("company_profile_url"),
  fal_license_url: text("fal_license_url"),
  approved: boolean("approved").notNull().default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProviderSchema = z.object({
  user_id: z.string().uuid(),
  company_name: z.string(),
  email: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  commercial_register_url: z.string().nullable().optional(),
  company_profile_url: z.string().nullable().optional(),
  fal_license_url: z.string().nullable().optional(),
});

export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providers.$inferSelect;

// Provider offers model
export const providerOffers = pgTable("provider_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  request_id: uuid("request_id").notNull(),
  provider_id: uuid("provider_id").notNull(),
  offer_file_url: text("offer_file_url"),
  notes: text("notes"),
  price_total: numeric("price_total"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProviderOfferSchema = z.object({
  request_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  offer_file_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  price_total: z.string().nullable().optional(),
  status: z.string().optional(),
});

export type InsertProviderOffer = z.infer<typeof insertProviderOfferSchema>;
export type ProviderOffer = typeof providerOffers.$inferSelect;
