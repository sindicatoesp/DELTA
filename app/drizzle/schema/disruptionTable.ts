import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	text,
	jsonb,
	bigint,
	numeric,
} from "drizzle-orm/pg-core";
import { sectorTable } from "./sectorTable";
import { disasterRecordsTable } from "./disasterRecordsTable";

export const disruptionTable = pgTable("disruption", {
	apiImportId: text("api_import_id"),
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	recordId: uuid("record_id")
		.references((): AnyPgColumn => disasterRecordsTable.id)
		.notNull(),
	sectorId: uuid("sector_id")
		.references((): AnyPgColumn => sectorTable.id)
		.notNull(),
	durationDays: bigint("duration_days", { mode: "number" }),
	durationHours: bigint("duration_hours", { mode: "number" }),
	usersAffected: bigint("users_affected", { mode: "number" }),
	peopleAffected: bigint("people_affected", { mode: "number" }),
	comment: text("comment"),
	responseOperation: text("response_operation"),
	responseCost: numeric("response_cost"),
	responseCurrency: text("response_currency"),
	spatialFootprint: jsonb("spatial_footprint"),
	attachments: jsonb("attachments"),
});

export const disruptionRel = relations(disruptionTable, ({ one }) => ({
	sector: one(sectorTable, {
		fields: [disruptionTable.sectorId],
		references: [sectorTable.id],
	}),
	disasterRecord: one(disasterRecordsTable, {
		fields: [disruptionTable.recordId],
		references: [disasterRecordsTable.id],
	}),
}));

export type SelectDisruption = typeof disruptionTable.$inferSelect;
export type InsertDisruption = typeof disruptionTable.$inferInsert;
