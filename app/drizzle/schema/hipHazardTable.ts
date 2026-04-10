import { relations } from "drizzle-orm";
import { pgTable, text, AnyPgColumn, jsonb } from "drizzle-orm/pg-core";
import { hipClusterTable } from "./hipClusterTable";
import { disasterRecordsTable } from "./disasterRecordsTable";

// examples:
// MH0004,Flood,Coastal Flood
// GH0001,Seismogenic (Earthquakes),Earthquake

export const hipHazardTable = pgTable("hip_hazard", {
	id: text("id").primaryKey(),
	code: text("code").notNull().default(""),
	clusterId: text("cluster_id")
		.references((): AnyPgColumn => hipClusterTable.id)
		.notNull(),
	name_en: text("name_en").notNull().default(""),
	description: jsonb("description")
		.$type<Record<string, string>>()
		.default({})
		.notNull(),
});

export const hipHazardRel = relations(hipHazardTable, ({ one }) => ({
	cluster: one(hipClusterTable, {
		fields: [hipHazardTable.clusterId],
		references: [hipClusterTable.id],
	}),
}));
/**
 * Pending final design confirmation from @sindicatoesp, this table's structure, especially its sector linkage,
 * may be revised to align with new requirements and ensure data integrity.
 */

export type SelectDisasterRecords = typeof disasterRecordsTable.$inferSelect;
export type InsertDisasterRecords = typeof disasterRecordsTable.$inferInsert;
