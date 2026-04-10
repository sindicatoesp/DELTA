import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	text,
	timestamp,
	jsonb,
	unique,
	bigint,
	boolean,
	numeric,
} from "drizzle-orm/pg-core";
import { eventTable } from "./eventTable";
import { hazardousEventTable } from "../../modules/hazardous-event/infrastructure/db/schema";
import { countryAccountsTable } from "./countryAccountsTable";
import { hipHazardTable } from "./hipHazardTable";
import { hipClusterTable } from "./hipClusterTable";
import { hipTypeTable } from "./hipTypeTable";

export const disasterEventTable = pgTable(
	"disaster_event",
	{
		updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
		createdAt: timestamp("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		approvalStatus: text({
			enum: [
				"draft",
				"waiting-for-validation",
				"needs-revision",
				"validated",
				"published",
			],
		})
			.notNull()
			.default("draft"),
		apiImportId: text("api_import_id"),
		hipHazardId: text("hip_hazard_id").references(
			(): AnyPgColumn => hipHazardTable.id,
		),
		hipClusterId: text("hip_cluster_id").references(
			(): AnyPgColumn => hipClusterTable.id,
		),
		hipTypeId: text("hip_type_id").references(
			(): AnyPgColumn => hipTypeTable.id,
		),
		countryAccountsId: uuid("country_accounts_id").references(
			() => countryAccountsTable.id,
			{
				onDelete: "cascade",
			},
		),
		id: uuid("id")
			.primaryKey()
			.references((): AnyPgColumn => eventTable.id),
		hazardousEventId: uuid("hazardous_event_id").references(
			(): AnyPgColumn => hazardousEventTable.id,
		),
		disasterEventId: uuid("disaster_event_id").references(
			(): AnyPgColumn => disasterEventTable.id,
		),
		nationalDisasterId: text("national_disaster_id").notNull().default(""),
		// multiple other ids
		otherId1: text("other_id1").notNull().default(""),
		otherId2: text("other_id2").notNull().default(""),
		otherId3: text("other_id3").notNull().default(""),
		nameNational: text("name_national").notNull().default(""),
		glide: text("glide").notNull().default(""),
		nameGlobalOrRegional: text("name_global_or_regional").notNull().default(""),
		// yyyy or yyyy-mm or yyyy-mm-dd
		startDate: text("start_date").notNull().default(""),
		endDate: text("end_date").notNull().default(""),
		startDateLocal: text("start_date_local"),
		endDateLocal: text("end_date_local"),
		durationDays: bigint("duration_days", { mode: "number" }),
		disasterDeclaration: text("disaster_declaration", {
			enum: ["yes", "no", "unknown"],
		})
			.notNull()
			.default("unknown"),
		// multiple disaster declartions
		disasterDeclarationTypeAndEffect1: text(
			"disaster_declaration_type_and_effect1",
		)
			.notNull()
			.default(""),
		disasterDeclarationDate1: timestamp("disaster_declaration_date1"),
		disasterDeclarationTypeAndEffect2: text(
			"disaster_declaration_type_and_effect2",
		)
			.notNull()
			.default(""),
		disasterDeclarationDate2: timestamp("disaster_declaration_date2"),
		disasterDeclarationTypeAndEffect3: text(
			"disaster_declaration_type_and_effect3",
		)
			.notNull()
			.default(""),
		disasterDeclarationDate3: timestamp("disaster_declaration_date3"),
		disasterDeclarationTypeAndEffect4: text(
			"disaster_declaration_type_and_effect4",
		)
			.notNull()
			.default(""),
		disasterDeclarationDate4: timestamp("disaster_declaration_date4"),
		disasterDeclarationTypeAndEffect5: text(
			"disaster_declaration_type_and_effect5",
		)
			.notNull()
			.default(""),
		disasterDeclarationDate5: timestamp("disaster_declaration_date5"),

		hadOfficialWarningOrWeatherAdvisory: boolean(
			"had_official_warning_or_weather_advisory",
		)
			.notNull()
			.default(false),
		officialWarningAffectedAreas: text("official_warning_affected_areas")
			.notNull()
			.default(""),

		// multiple early actions fields
		earlyActionDescription1: text("early_action_description1")
			.notNull()
			.default(""),
		earlyActionDate1: timestamp("early_action_date1"),
		earlyActionDescription2: text("early_action_description2")
			.notNull()
			.default(""),
		earlyActionDate2: timestamp("early_action_date2"),
		earlyActionDescription3: text("early_action_description3")
			.notNull()
			.default(""),
		earlyActionDate3: timestamp("early_action_date3"),
		earlyActionDescription4: text("early_action_description4")
			.notNull()
			.default(""),
		earlyActionDate4: timestamp("early_action_date4"),
		earlyActionDescription5: text("early_action_description5")
			.notNull()
			.default(""),
		earlyActionDate5: timestamp("early_action_date5"),

		// multiple rapid or preliminary assessments
		rapidOrPreliminaryAssessmentDescription1: text(
			"rapid_or_preliminary_assesment_description1",
		),
		rapidOrPreliminaryAssessmentDate1: timestamp(
			"rapid_or_preliminary_assessment_date1",
		),
		rapidOrPreliminaryAssessmentDescription2: text(
			"rapid_or_preliminary_assesment_description2",
		),
		rapidOrPreliminaryAssessmentDate2: timestamp(
			"rapid_or_preliminary_assessment_date2",
		),
		rapidOrPreliminaryAssessmentDescription3: text(
			"rapid_or_preliminary_assesment_description3",
		),
		rapidOrPreliminaryAssessmentDate3: timestamp(
			"rapid_or_preliminary_assessment_date3",
		),
		rapidOrPreliminaryAssessmentDescription4: text(
			"rapid_or_preliminary_assesment_description4",
		),
		rapidOrPreliminaryAssessmentDate4: timestamp(
			"rapid_or_preliminary_assessment_date4",
		),
		rapidOrPreliminaryAssessmentDescription5: text(
			"rapid_or_preliminary_assesment_description5",
		),
		rapidOrPreliminaryAssessmentDate5: timestamp(
			"rapid_or_preliminary_assessment_date5",
		),

		responseOperations: text("response_oprations").notNull().default(""),

		// multiple post disaster assessments
		postDisasterAssessmentDescription1: text(
			"post_disaster_assessment_description1",
		),
		postDisasterAssessmentDate1: timestamp("post_disaster_assessment_date1"),
		postDisasterAssessmentDescription2: text(
			"post_disaster_assessment_description2",
		),
		postDisasterAssessmentDate2: timestamp("post_disaster_assessment_date2"),
		postDisasterAssessmentDescription3: text(
			"post_disaster_assessment_description3",
		),
		postDisasterAssessmentDate3: timestamp("post_disaster_assessment_date3"),
		postDisasterAssessmentDescription4: text(
			"post_disaster_assessment_description4",
		),
		postDisasterAssessmentDate4: timestamp("post_disaster_assessment_date4"),
		postDisasterAssessmentDescription5: text(
			"post_disaster_assessment_description5",
		),
		postDisasterAssessmentDate5: timestamp("post_disaster_assessment_date5"),

		// multiple other assessments
		otherAssessmentDescription1: text("other_assessment_description1"),
		otherAssessmentDate1: timestamp("other_assessment_date1"),
		otherAssessmentDescription2: text("other_assessment_description2"),
		otherAssessmentDate2: timestamp("other_assessment_date2"),
		otherAssessmentDescription3: text("other_assessment_description3"),
		otherAssessmentDate3: timestamp("other_assessment_date3"),
		otherAssessmentDescription4: text("other_assessment_description4"),
		otherAssessmentDate4: timestamp("other_assessment_date4"),
		otherAssessmentDescription5: text("other_assessment_description5"),
		otherAssessmentDate5: timestamp("other_assessment_date5"),

		dataSource: text("data_source").notNull().default(""),
		recordingInstitution: text("recording_institution").notNull().default(""),
		effectsTotalUsd: numeric("effects_total_usd"),
		nonEconomicLosses: text("non_economic_losses").notNull().default(""),
		damagesSubtotalLocalCurrency: numeric("damages_subtotal_local_currency"),
		lossesSubtotalUSD: numeric("losses_subtotal_usd"),
		responseOperationsDescription: text("response_operations_description")
			.notNull()
			.default(""),
		responseOperationsCostsLocalCurrency: numeric(
			"response_operations_costs_local_currency",
		),
		responseCostTotalLocalCurrency: numeric(
			"response_cost_total_local_currency",
		),
		responseCostTotalUSD: numeric("response_cost_total_usd"),
		humanitarianNeedsDescription: text("humanitarian_needs_description")
			.notNull()
			.default(""),
		humanitarianNeedsLocalCurrency: numeric(
			"humanitarian_needs_local_currency",
		),
		humanitarianNeedsUSD: numeric("humanitarian_needs_usd"),

		rehabilitationCostsLocalCurrencyCalc: numeric(
			"rehabilitation_costs_local_currency_calc",
		),
		rehabilitationCostsLocalCurrencyOverride: numeric(
			"rehabilitation_costs_local_currency_override",
		),
		//rehabilitationCostsUSD: numeric("rehabilitation_costs_usd"),
		repairCostsLocalCurrencyCalc: numeric("repair_costs_local_currency_calc"),
		repairCostsLocalCurrencyOverride: numeric(
			"repair_costs_local_currency_override",
		),
		//repairCostsUSD: numeric("repair_costs_usd"),
		replacementCostsLocalCurrencyCalc: numeric(
			"replacement_costs_local_currency_calc",
		),
		replacementCostsLocalCurrencyOverride: numeric(
			"replacement_costs_local_currency_override",
		),
		//replacementCostsUSD: numeric("replacement_costs_usd"),
		recoveryNeedsLocalCurrencyCalc: numeric(
			"recovery_needs_local_currency_calc",
		),
		recoveryNeedsLocalCurrencyOverride: numeric(
			"recovery_needs_local_currency_override",
		),
		//recoveryNeedsUSD: numeric("recovery_needs_usd"),
		attachments: jsonb("attachments"),
		spatialFootprint: jsonb("spatial_footprint"),

		legacyData: jsonb("legacy_data"),
	},
	(table) => ({
		// Composite unique constraint for tenant-scoped api_import_id
		disasterEventApiImportIdTenantUnique: unique(
			"disaster_event_api_import_id_tenant_unique",
		).on(table.apiImportId, table.countryAccountsId),
	}),
);

export type SelectDisasterEvent = typeof disasterEventTable.$inferSelect;
export type InsertDisasterEvent = typeof disasterEventTable.$inferInsert;

export const disasterEventTableConstrains = {
	hazardousEventId: "disaster_event_hazardous_event_id_hazardous_event_id_fk",
	countryAccountsId:
		"disaster_event_country_accounts_id_country_accounts_id_fk",
};

export const disasterEventRel = relations(disasterEventTable, ({ one }) => ({
	event: one(eventTable, {
		fields: [disasterEventTable.id],
		references: [eventTable.id],
	}),
	countryAccount: one(countryAccountsTable, {
		fields: [disasterEventTable.countryAccountsId],
		references: [countryAccountsTable.id],
	}),
	hazardousEvent: one(hazardousEventTable, {
		fields: [disasterEventTable.hazardousEventId],
		references: [hazardousEventTable.id],
	}),
	disasterEvent: one(disasterEventTable, {
		fields: [disasterEventTable.disasterEventId],
		references: [disasterEventTable.id],
	}),
	hipHazard: one(hipHazardTable, {
		fields: [disasterEventTable.hipHazardId],
		references: [hipHazardTable.id],
	}),
	hipCluster: one(hipClusterTable, {
		fields: [disasterEventTable.hipClusterId],
		references: [hipClusterTable.id],
	}),
	hipType: one(hipTypeTable, {
		fields: [disasterEventTable.hipTypeId],
		references: [hipTypeTable.id],
	}),
}));
