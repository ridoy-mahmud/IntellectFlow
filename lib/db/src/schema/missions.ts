import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("draft"),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  progress: real("progress").notNull().default(0),
  agents: jsonb("agents").notNull().default([]),
  estimatedCost: real("estimated_cost").default(0),
  tokensUsed: integer("tokens_used").default(0),
  elapsedSeconds: integer("elapsed_seconds").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  launchedAt: timestamp("launched_at"),
  completedAt: timestamp("completed_at"),
});

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").references(() => missionsTable.id, { onDelete: "cascade" }).notNull(),
  agentType: text("agent_type").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMissionSchema = createInsertSchema(missionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogsTable).omit({ id: true, createdAt: true });

export type Mission = typeof missionsTable.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type ActivityLog = typeof activityLogsTable.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
