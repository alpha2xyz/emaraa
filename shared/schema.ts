import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users model
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("owner"), // owner, provider
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Property model - المحدث بالكامل
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  building_type: text("building_type").notNull(), // residential, commercial, mixed
  address: text("address").notNull(),
  city: text("city").notNull(),
  units_count: integer("units_count").default(0),
  map_url: text("map_url"),
  owner_id: uuid("owner_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  created_at: true,
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

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  created_at: true,
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requests.$inferSelect;
