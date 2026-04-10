import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	text,
	jsonb,
	boolean,
	bigint,
	numeric,
} from "drizzle-orm/pg-core";
import { sectorTable } from "./sectorTable";
import { disasterRecordsTable } from "./disasterRecordsTable";
import { assetTable } from "./assetTable";

export const damagesTable = pgTable("damages", {
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
	assetId: uuid("asset_id")
		.references((): AnyPgColumn => assetTable.id)
		.notNull(),

	unit: text("unit", {
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

	totalDamageAmount: bigint("total_damage_amount", { mode: "number" }),
	totalDamageAmountOverride: boolean("total_damage_amount_override")
		.notNull()
		.default(false),
	totalRepairReplacement: numeric("total_repair_replacement"),
	totalRepairReplacementOverride: boolean("total_repair_replacement_override")
		.notNull()
		.default(false),
	totalRecovery: numeric("total_recovery"),
	totalRecoveryOverride: boolean("total_recovery_override")
		.notNull()
		.default(false),

	// Partially damaged
	pdDamageAmount: bigint("pd_damage_amount", { mode: "number" }),
	pdRepairCostUnit: numeric("pd_repair_cost_unit"),
	pdRepairCostUnitCurrency: text("pd_repair_cost_unit_currency"),
	pdRepairCostTotal: numeric("pd_repair_cost_total"),
	pdRepairCostTotalOverride: boolean("pd_repair_cost_total_override")
		.notNull()
		.default(false),
	pdRecoveryCostUnit: numeric("pd_recovery_cost_unit"),
	pdRecoveryCostUnitCurrency: text("pd_recovery_cost_unit_currency"),
	pdRecoveryCostTotal: numeric("pd_recovery_cost_total"),
	pdRecoveryCostTotalOverride: boolean("pd_recovery_cost_total_override")
		.notNull()
		.default(false),
	pdDisruptionDurationDays: bigint("pd_disruption_duration_days", {
		mode: "number",
	}),
	pdDisruptionDurationHours: bigint("pd_disruption_duration_hours", {
		mode: "number",
	}),
	pdDisruptionUsersAffected: bigint("pd_disruption_users_affected", {
		mode: "number",
	}),
	pdDisruptionPeopleAffected: bigint("pd_disruption_people_affected", {
		mode: "number",
	}),
	pdDisruptionDescription: text("pd_disruption_description"),

	// Totally destroyed
	tdDamageAmount: bigint("td_damage_amount", { mode: "number" }),
	tdReplacementCostUnit: numeric("td_replacement_cost_unit"),
	tdReplacementCostUnitCurrency: text("td_replacement_cost_unit_currency"),
	tdReplacementCostTotal: numeric("td_replacement_cost_total"),
	tdReplacementCostTotalOverride: boolean("td_replacement_cost_total_override")
		.notNull()
		.default(false),
	tdRecoveryCostUnit: numeric("td_recovery_cost_unit"),
	tdRecoveryCostUnitCurrency: text("td_recovery_cost_unit_currency"),
	tdRecoveryCostTotal: numeric("td_recovery_cost_total"),
	tdRecoveryCostTotalOverride: boolean("td_recovery_cost_total_override")
		.notNull()
		.default(false),
	tdDisruptionDurationDays: bigint("td_disruption_duration_days", {
		mode: "number",
	}),
	tdDisruptionDurationHours: bigint("td_disruption_duration_hours", {
		mode: "number",
	}),
	tdDisruptionUsersAffected: bigint("td_disruption_users_affected", {
		mode: "number",
	}),
	tdDisruptionPeopleAffected: bigint("td_disruption_people_affected", {
		mode: "number",
	}),
	tdDisruptionDescription: text("td_disruption_description"),

	spatialFootprint: jsonb("spatial_footprint"),
	attachments: jsonb("attachments"),
});

export const damagesRel = relations(damagesTable, ({ one }) => ({
	asset: one(assetTable, {
		fields: [damagesTable.assetId],
		references: [assetTable.id],
	}),
	sector: one(sectorTable, {
		fields: [damagesTable.sectorId],
		references: [sectorTable.id],
	}),
	disasterRecord: one(disasterRecordsTable, {
		fields: [damagesTable.recordId],
		references: [disasterRecordsTable.id],
	}),
}));

export type SelectDamages = typeof damagesTable.$inferSelect;
export type InsertDamages = typeof damagesTable.$inferInsert;
