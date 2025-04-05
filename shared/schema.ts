import { pgTable, text, serial, integer, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  department: text("department"),
  role: text("role").default("user").notNull(),
  extension: text("extension"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Department schema
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  costCenter: text("cost_center"),
  manager: text("manager"),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

// Call types
export const CALL_TYPES = ["internal", "local", "long-distance", "international"] as const;

// Call records schema
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sourceExtension: text("source_extension").notNull(),
  sourceDepartment: text("source_department"),
  destinationNumber: text("destination_number").notNull(),
  destinationType: text("destination_type").notNull(),
  callType: text("call_type").notNull(), // One of CALL_TYPES
  duration: integer("duration").notNull(), // Duration in seconds
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
});

// Rate configuration schema
export const rates = pgTable("rates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  callType: text("call_type").notNull(), // One of CALL_TYPES
  ratePerMinute: numeric("rate_per_minute", { precision: 10, scale: 4 }).notNull(),
  connectionFee: numeric("connection_fee", { precision: 10, scale: 2 }).default("0").notNull(),
  description: text("description"),
  prefix: text("prefix"), // For matching international/long-distance codes
});

export const insertRateSchema = createInsertSchema(rates).omit({
  id: true,
});

// Invoices schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  department: text("department").notNull(),
  fromDate: timestamp("from_date").notNull(),
  toDate: timestamp("to_date").notNull(),
  totalCalls: integer("total_calls").notNull(),
  totalDuration: integer("total_duration").notNull(), // in seconds
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  details: jsonb("details").notNull(), // Breakdown of calls by type
  status: text("status").default("pending").notNull(), // pending, approved, paid
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  pdfUrl: text("pdf_url"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  generatedAt: true,
});

// Report templates schema
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // summary, detail, department, user, etc.
  filters: jsonb("filters").notNull(), // JSON object containing filters
  columns: jsonb("columns").notNull(), // JSON array of column names
  isDefault: boolean("is_default").default(false).notNull(),
  createdBy: integer("created_by").notNull(), // User ID
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;

export type Rate = typeof rates.$inferSelect;
export type InsertRate = z.infer<typeof insertRateSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

// Zod enums for validation
export const CallTypeEnum = z.enum(CALL_TYPES);
export type CallType = z.infer<typeof CallTypeEnum>;
