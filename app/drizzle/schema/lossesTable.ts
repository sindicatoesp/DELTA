import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	boolean,
	text,
	jsonb,
	bigint,
	numeric,
} from "drizzle-orm/pg-core";
import { sectorTable } from "./sectorTable";
import { disasterRecordsTable } from "./disasterRecordsTable";

/////////////////////////////////////////////////////

export const lossesTable = pgTable("losses", {
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
	sectorIsAgriculture: boolean("sector_is_agriculture").notNull(),
	typeNotAgriculture: text("type_not_agriculture"),
	typeAgriculture: text("type_agriculture"),
	relatedToNotAgriculture: text("related_to_not_agriculture"),
	relatedToAgriculture: text("related_to_agriculture"),
	description: text("description"),
	publicUnit: text("public_value_unit", {
		enum: [
			"number_count",
			"area_m2",
			"area_km2",
			"area_ha",
			"area_mi2",
			"area_ac",
			"area_ft2",
			"area_yd2",
			"volume_l",
			"volume_m3",
			"volume_ft3",
			"volume_yd3",
			"volume_gal",
			"volume_bbl",
			"duration_days",
			"duration_hours",
		],
	}),
	publicUnits: bigint("public_units", { mode: "number" }),
	publicCostUnit: numeric("public_cost_unit"),
	publicCostUnitCurrency: text("public_cost_unit_currency"),
	publicCostTotal: numeric("public_cost_total"),
	publicCostTotalOverride: boolean("public_cost_total_override")
		.notNull()
		.default(false),
	privateUnit: text("private_value_unit", {
		enum: [
			"number_count",
			"area_m2",
			"area_km2",
			"area_ha",
			"area_mi2",
			"area_ac",
			"area_ft2",
			"area_yd2",
			"volume_l",
			"volume_m3",
			"volume_ft3",
			"volume_yd3",
			"volume_gal",
			"volume_bbl",
			"duration_days",
			"duration_hours",
		],
	}),
	privateUnits: bigint("private_units", { mode: "number" }),
	privateCostUnit: numeric("private_cost_unit"),
	privateCostUnitCurrency: text("private_cost_unit_currency"),
	privateCostTotal: numeric("private_cost_total"),
	privateCostTotalOverride: boolean("private_cost_total_override")
		.notNull()
		.default(false),
	spatialFootprint: jsonb("spatial_footprint"),
	attachments: jsonb("attachments"),
});

export const lossesRel = relations(lossesTable, ({ one }) => ({
	sector: one(sectorTable, {
		fields: [lossesTable.sectorId],
		references: [sectorTable.id],
	}),
	disasterRecord: one(disasterRecordsTable, {
		fields: [lossesTable.recordId],
		references: [disasterRecordsTable.id],
	}),
}));

export type SelectLosses = typeof lossesTable.$inferSelect;
export type InsertLosses = typeof lossesTable.$inferInsert;
