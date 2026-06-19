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
  updated_at: timestamp("updated_at").defaultNow(),
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
  commercial_register_url: text("commercial_register_url").notNull(),
  company_profile_url: text("company_profile_url").notNull(),
  fal_license_url: text("fal_license_url"),
  approved: boolean("approved").default(false),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertProviderSchema = z.object({
  user_id: z.string().uuid(),
  company_name: z.string(),
  email: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  commercial_register_url: z.string(),
  company_profile_url: z.string(),
  fal_license_url: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});

export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providers.$inferSelect;

// Provider offers model
export const providerOffers = pgTable("provider_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  request_id: uuid("request_id"),
  provider_id: uuid("provider_id"),
  offer_file_url: text("offer_file_url"),
  notes: text("notes"),
  price_total: numeric("price_total"),
  status: text("status").default("pending"),
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

// Deals model — captures a closed contract + its value (powers GMV / case studies / REGA file)
// A deal is auto-created (status "pending") when an owner accepts an offer; admin confirms
// the final contract value and marks it "closed" with a signed date.
export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  request_id: uuid("request_id").notNull(),
  offer_id: uuid("offer_id").notNull(),
  provider_id: uuid("provider_id").notNull(),
  owner_id: uuid("owner_id").notNull(),
  contract_value: numeric("contract_value"), // final annual contract value in SAR
  status: text("status").notNull().default("pending"), // pending | closed | cancelled
  signed_at: timestamp("signed_at", { withTimezone: true }),
  notes: text("notes"),
  // 1% commission workflow — timestamps drive the email chain + dedup.
  // commission_email_sent_at: set when the "transfer the 1% commission" email goes out (on accept).
  // commission_reminder_sent_at: set when the 1-day feedback/reminder email goes out (daily cron).
  commission_email_sent_at: timestamp("commission_email_sent_at", { withTimezone: true }),
  commission_reminder_sent_at: timestamp("commission_reminder_sent_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertDealSchema = z.object({
  request_id: z.string().uuid(),
  offer_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  contract_value: z.string().nullable().optional(),
  status: z.string().optional(),
  signed_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

// SMS log — every Authentica send is recorded with its outcome (billing reconciliation + failure visibility)
export const smsLog = pgTable("sms_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  message_type: text("message_type"), // new_request | offer_submitted | offer_accepted | provider_approved | otp
  status: text("status").notNull(), // sent | failed
  error: text("error"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type SmsLog = typeof smsLog.$inferSelect;

// Sessions model (server-managed auth sessions)
export const sessions = pgTable("sessions", {
  token: uuid("token").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  role: text("role").notNull().default("owner"),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Session = typeof sessions.$inferSelect;

// Admins model (admin dashboard users)
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  session_token: text("session_token"),
  session_expires_at: timestamp("session_expires_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Admin = typeof admins.$inferSelect;

// OTP rate limits (DB-backed, survives cold starts)
export const otpRateLimits = pgTable("otp_rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type OtpRateLimit = typeof otpRateLimits.$inferSelect;

// Admin login attempts (IP-based rate limiting)
export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ip: text("ip").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type AdminLoginAttempt = typeof adminLoginAttempts.$inferSelect;

// SMS rate limits (per-user, per-endpoint)
export const smsRateLimits = pgTable("sms_rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SmsRateLimit = typeof smsRateLimits.$inferSelect;

// Admin impersonation log (audit trail)
export const adminImpersonationLog = pgTable("admin_impersonation_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  admin_id: uuid("admin_id"),
  admin_username: text("admin_username"),
  target_user_id: uuid("target_user_id").notNull(),
  target_role: text("target_role"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminImpersonationLog = typeof adminImpersonationLog.$inferSelect;
