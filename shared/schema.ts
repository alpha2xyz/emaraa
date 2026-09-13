import { pgTable, text, integer, timestamp, uuid, boolean, numeric, jsonb, index, date } from "drizzle-orm/pg-core";
import { z } from "zod";

// Users model
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"), // optional — owners opt in to email notifications about their requests
  role: text("role").notNull().default("owner"), // owner, provider
  created_at: timestamp("created_at").defaultNow(),
  // Written on every successful OTP verify (register + login) — powers the
  // 2-month owner-inactivity auto-drop in /api/cron/request-lifecycle.
  last_login_at: timestamp("last_login_at", { withTimezone: true }),
  // Stamped when the post-verification activation nudge goes out, so the daily
  // cron nudges a stalled owner once rather than every morning forever.
  activation_nudged_at: timestamp("activation_nudged_at", { withTimezone: true }),
});

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
}, (t) => ({
  ownerIdx: index("idx_properties_owner_id").on(t.owner_id),
}));

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
  // When the owner wants the contract to start. Providers price differently for
  // "next month" than for "in six months", and the offer's duration_months is
  // measured from here, so together they define the actual contract period.
  contract_start_date: date("contract_start_date"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (t) => ({
  ownerIdx: index("idx_requests_owner_id").on(t.owner_id),
  statusIdx: index("idx_requests_status").on(t.status),
  propertyIdx: index("idx_requests_property_id").on(t.property_id),
}));

export const insertRequestSchema = z.object({
  owner_id: z.string().uuid().optional(),
  property_id: z.string().uuid(),
  service_category: z.string().optional(),
  description: z.string().nullable().optional(),
  // ISO date only (YYYY-MM-DD); the column is DATE, not a timestamp.
  contract_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "contract_start_date must be YYYY-MM-DD")
    .nullable()
    .optional(),
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
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Provider = typeof providers.$inferSelect;

// Provider offers model
//
// Structured fields added 2026-09-13 (master plan v1006 item #26). Before that an
// offer was a PDF plus a single number, which is exactly what the owner in the
// 2026-09-07 feedback refused to act on: he wanted to see what he was buying, not
// a total. line_items carries the service breakdown; price_total stays the single
// authoritative figure because terms.tsx pins the 1% commission to it, so it is
// never derived from the line items.
//
// Deliberately NOT stored: price per unit. It is price_total / units_count and is
// already computed at display time; storing a second copy only lets the two drift.
export const providerOffers = pgTable("provider_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  request_id: uuid("request_id").notNull(),
  provider_id: uuid("provider_id").notNull(),
  offer_file_url: text("offer_file_url"), // optional since 2026-09-13
  notes: text("notes"),
  price_total: numeric("price_total"),
  // [{ service: string, price_per_unit: number }]
  line_items: jsonb("line_items").$type<OfferLineItem[]>(),
  duration_months: integer("duration_months"),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
}, (t) => ({
  providerIdx: index("idx_provider_offers_provider_id").on(t.provider_id),
  requestIdx: index("idx_provider_offers_request_id").on(t.request_id),
}));

export type OfferLineItem = { service: string; price_per_unit: number };

export const offerLineItemSchema = z.object({
  service: z.string().trim().min(2).max(120),
  price_per_unit: z.number().nonnegative(),
});

export const insertProviderOfferSchema = z.object({
  request_id: z.string().uuid(),
  offer_file_url: z.string().max(400).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  price_total: z.number().positive(),
  line_items: z.array(offerLineItemSchema).min(1).max(20),
  duration_months: z.number().int().positive().max(120),
});

export type InsertProviderOffer = z.infer<typeof insertProviderOfferSchema>;
export type ProviderOffer = typeof providerOffers.$inferSelect;

// Why a provider passed on a request (master plan v1006 item #26).
// Three of four approved providers have never submitted a single offer and nobody
// knows why. A dismissal with a reason turns that silence into data.
export const offerDeclines = pgTable("offer_declines", {
  id: uuid("id").primaryKey().defaultRandom(),
  request_id: uuid("request_id").notNull(),
  provider_id: uuid("provider_id").notNull(),
  reason: text("reason").notNull(), // scope_unclear | out_of_area | too_small | other
  note: text("note"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const DECLINE_REASONS = ["scope_unclear", "out_of_area", "too_small", "other"] as const;
export type DeclineReason = (typeof DECLINE_REASONS)[number];

export const insertOfferDeclineSchema = z.object({
  request_id: z.string().uuid(),
  reason: z.enum(DECLINE_REASONS),
  note: z.string().max(500).nullable().optional(),
});

export type OfferDecline = typeof offerDeclines.$inferSelect;

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
  // 1% commission workflow — both timestamps are stamped by the daily cron
  // (/api/cron/commission-reminder), scheduled off created_at (the acceptance moment),
  // not at accept-time. Independent of each other; dedup only.
  // commission_reminder_sent_at: set when the day-7 check-in email goes out.
  // commission_email_sent_at: set when the day-21 "transfer the 1% commission" email goes out.
  commission_email_sent_at: timestamp("commission_email_sent_at", { withTimezone: true }),
  commission_reminder_sent_at: timestamp("commission_reminder_sent_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  // The only index of the six in master plan v1006 that was genuinely absent
  // from production; the other five already existed (verified 2026-09-13).
  requestIdx: index("idx_deals_request_id").on(t.request_id),
}));

export type Deal = typeof deals.$inferSelect;

// Email delivery log — one row per outbound email attempt.
// Written by server/email.ts (sendEmail + suppressed_test path) and read by buildAdminReport
// to find the "since last report" cutoff (kind=admin_report, status=sent).
export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  to_email: text("to_email").notNull(),
  subject: text("subject"),
  kind: text("kind"), // admin_report | offer_accepted | ... (nullable)
  status: text("status").notNull(), // sent | failed | suppressed_test
  error: text("error"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type EmailLog = typeof emailLog.$inferSelect;

// Durable queue for outbound email. See server/outbox.ts for why this exists:
// the provider broadcast used to run as sequential awaits on the request path and
// would time out once the approved-provider list grew, losing notifications.
// Rows are written first, then sent in parallel immediately; the daily cron only
// retries what did not go out.
export const emailOutbox = pgTable("email_outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  to_email: text("to_email").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  kind: text("kind"),
  status: text("status").notNull().default("pending"), // pending | sent | failed
  attempts: integer("attempts").notNull().default(0),
  last_error: text("last_error"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  sent_at: timestamp("sent_at", { withTimezone: true }),
}, (t) => ({
  pendingIdx: index("idx_email_outbox_status_created").on(t.status, t.created_at),
}));

export type EmailOutbox = typeof emailOutbox.$inferSelect;

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

// OTP rate limits (DB-backed, survives cold starts).
// One row per attempt. `kind` separates the two counters: 'send' rows cap SMS
// spend, 'verify' rows cap code-guessing. Before 2026-09-13 only 'send' rows were
// ever written while /api/otp/verify counted the same rows, so the verify limit
// could never trigger and a 4-digit code was brute-forceable.
// `ip` backs the per-IP send cap; it is nullable because rows written before that
// date have none.
export const otpRateLimits = pgTable("otp_rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  ip: text("ip"),
  kind: text("kind").default("send"),
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
