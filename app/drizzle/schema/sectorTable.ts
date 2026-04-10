import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	jsonb,
	bigint,
	timestamp,
} from "drizzle-orm/pg-core";
import { sectorDisasterRecordsRelationTable } from "./sectorDisasterRecordsRelationTable";

/**
 * This sector table is configured to support hierarchical relationships and sector-specific details.
 * Changes may occur based on further project requirements.
 */
// examples:
// id: 39,
// parent_id: 19,
// sectorname": Agriculture,
// subsector: Crops
// description: The cultivation and harvesting of plants for food, fiber, and other products.

export const sectorTable = pgTable("sector", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	parentId: uuid("parent_id").references((): AnyPgColumn => sectorTable.id),
	name: jsonb("name").$type<Record<string, string>>().default({}).notNull(),
	description: jsonb("description")
		.$type<Record<string, string>>()
		.default({})
		.notNull(), // Optional description for the sector | Additional details about the sector
	level: bigint("level", { mode: "number" }).notNull().default(1), // value is parent level + 1 otherwise 1
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const sectoryParent_Rel = relations(sectorTable, ({ one }) => ({
	sectorParent: one(sectorTable, {
		fields: [sectorTable.parentId],
		references: [sectorTable.id],
	}),
})); // Types for TypeScript

export type SelectSector = typeof sectorTable.$inferSelect;
export type InsertSector =
	typeof sectorTable.$inferInsert; /** Relationships for `sectorTable` */

export const sectorRel = relations(sectorTable, ({ one, many }) => ({
	// A self-referencing relationship for hierarchical sectors
	parentSector: one(sectorTable, {
		fields: [sectorTable.parentId],
		references: [sectorTable.id],
	}),

	// Linking `sector` to `sector_disaster_records_relation`
	relatedDisasterRecords: many(sectorDisasterRecordsRelationTable, {
		relationName: "sector_disaster_records_relation",
	}),
}));
