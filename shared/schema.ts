import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Existing tables ──────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const insertContactSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  projectType: z.enum(["Freelance", "Business", "Affiliate", "User"], { required_error: "Please select a project type" }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// ── Green Agent MVP tables ───────────────────────────────────────────────────

// Producer — the farm / company registering batches
export const producers = pgTable("producers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  farmName: text("farm_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),          // null = registered before auth existed
  phone: text("phone"),
  country: text("country").notNull().default("IT"),
  region: text("region"),                       // e.g. "Sicilia"
  giCertificationNumber: text("gi_certification_number"),
  giType: text("gi_type"),                      // DOP | DOC | IGP
  certificationBody: text("certification_body"), // CSQA | DNV | Bureau Veritas
  status: text("status").notNull().default("pending"), // pending | active | suspended
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProducerSchema = createInsertSchema(producers).omit({ id: true, createdAt: true, status: true, passwordHash: true }).extend({
  name: z.string().min(2),
  farmName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  country: z.string().default("IT"),
  region: z.string().optional(),
  giCertificationNumber: z.string().optional(),
  giType: z.enum(["DOP", "DOC", "IGP"]).optional(),
  certificationBody: z.string().optional(),
});
export type InsertProducer = z.infer<typeof insertProducerSchema>;
export type Producer = typeof producers.$inferSelect;

// Plot — a registered geographic parcel
export const plots = pgTable("plots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  producerId: varchar("producer_id").notNull().references(() => producers.id),
  name: text("name").notNull(),                 // e.g. "Contrada Difesa Nord"
  skin: text("skin").notNull(),                 // bronte | etna | modica | yubari
  polygon: jsonb("polygon").notNull(),          // GeoJSON Polygon
  altitudeM: integer("altitude_m"),
  areaSqm: integer("area_sqm"),
  cadastralRef: text("cadastral_ref"),          // Italian: foglio/particella
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlotSchema = createInsertSchema(plots).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(2),
  skin: z.enum(["bronte", "etna", "modica", "yubari"]),
  polygon: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  altitudeM: z.number().optional(),
  areaSqm: z.number().optional(),
  cadastralRef: z.string().optional(),
  notes: z.string().optional(),
});
export type InsertPlot = z.infer<typeof insertPlotSchema>;
export type Plot = typeof plots.$inferSelect;

// Catasto parcels — loaded offline from AdE shapefiles, one row per particella
export const catastoParcels = pgTable("catasto_parcels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Identifiers from AdE shapefile fields
  comuneCodice: text("comune_codice").notNull(),   // 4-char codice catastale, e.g. "B202"
  foglio: text("foglio").notNull(),                // 4-digit foglio, e.g. "0001"
  sezione: text("sezione").notNull().default("00"), // 2-char section code, "00" for rural
  mappale: text("mappale").notNull(),              // particella number, e.g. "345"
  areaSqm: integer("area_sqm"),
  geometry: jsonb("geometry").notNull(),           // GeoJSON Polygon
  ingestedAt: timestamp("ingested_at").defaultNow().notNull(),
});

export type CatastoParcel = typeof catastoParcels.$inferSelect;

// Batch — a production lot submitted for verification
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchCode: text("batch_code").notNull().unique(), // e.g. BRN-2026-001
  producerId: varchar("producer_id").notNull().references(() => producers.id),
  plotId: varchar("plot_id").notNull().references(() => plots.id),
  skin: text("skin").notNull(),
  harvestDateFrom: text("harvest_date_from").notNull(), // ISO date
  harvestDateTo: text("harvest_date_to").notNull(),
  quantityKg: numeric("quantity_kg"),
  varietyNotes: text("variety_notes"),
  // Verification results
  verificationStatus: text("verification_status").notNull().default("pending"),
  // pending | verified | rejected | error
  ndviAvg: numeric("ndvi_avg"),
  ndviConfidence: integer("ndvi_confidence"),
  satelliteIntervals: jsonb("satellite_intervals"),
  verifiedAt: timestamp("verified_at"),
  // On-chain
  txHash: text("tx_hash"),
  chainId: integer("chain_id"),
  anchoredAt: timestamp("anchored_at"),
  // Detailed verification layers (zone, phenology, plausibility)
  verificationDetails: jsonb("verification_details"),
  // DPP
  dppIssued: boolean("dpp_issued").default(false),
  dppIssuedAt: timestamp("dpp_issued_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true, createdAt: true, verificationStatus: true,
  ndviAvg: true, ndviConfidence: true, satelliteIntervals: true,
  verifiedAt: true, txHash: true, chainId: true, anchoredAt: true,
  dppIssued: true, dppIssuedAt: true,
}).extend({
  batchCode: z.string().min(3),
  skin: z.enum(["bronte", "etna", "modica", "yubari"]),
  harvestDateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  harvestDateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantityKg: z.number().positive().optional(),
  varietyNotes: z.string().optional(),
});
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;
