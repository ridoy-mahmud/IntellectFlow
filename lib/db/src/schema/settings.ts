import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProfileTable = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Commander Jane"),
  email: text("email").notNull().default("jane@intellectflow.io"),
  role: text("role").notNull().default("Admin"),
  timezone: text("timezone").notNull().default("UTC"),
  avatarUrl: text("avatar_url"),
  notifyMissionComplete: boolean("notify_mission_complete").notNull().default(true),
  notifyMissionFailed: boolean("notify_mission_failed").notNull().default(true),
  notifyAgentActivity: boolean("notify_agent_activity").notNull().default(false),
  notifyWeeklyReport: boolean("notify_weekly_report").notNull().default(true),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  defaultModel: text("default_model").notNull().default("gpt-4o"),
  fallbackModel: text("fallback_model").notNull().default("claude-3-5-sonnet"),
  maxTokensPerRun: integer("max_tokens_per_run").notNull().default(100000),
  temperature: text("temperature").notNull().default("0.7"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  service: text("service").notNull(),
  keyMasked: text("key_masked").notNull(),
  keyHash: text("key_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfileTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiKeySchema = createInsertSchema(apiKeysTable).omit({ id: true, createdAt: true });

export type UserProfile = typeof userProfileTable.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type ApiKey = typeof apiKeysTable.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
