import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	text,
	timestamp,
	jsonb,
	unique,
} from "drizzle-orm/pg-core";
import { disasterEventTable } from "./disasterEventTable";
import { hipClusterTable } from "./hipClusterTable";
import { hipHazardTable } from "./hipHazardTable";
import { hipTypeTable } from "./hipTypeTable";
import { countryAccountsTable } from "./countryAccountsTable";
import { sectorDisasterRecordsRelationTable } from "./sectorDisasterRecordsRelationTable";

export const disasterRecordsTable = pgTable(
	"disaster_records",
	{
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
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		countryAccountsId: uuid("country_accounts_id").references(
			() => countryAccountsTable.id,
			{
				onDelete: "cascade",
			},
		),
		disasterEventId: uuid("disaster_event_id").references(
			(): AnyPgColumn => disasterEventTable.id,
		),
		locationDesc: text("location_desc"),
		// yyyy or yyyy-mm or yyyy-mm-dd
		startDate: text("start_date"),
		endDate: text("end_date"),
		localWarnInst: text("local_warn_inst"),
		primaryDataSource: text("primary_data_source"),
		otherDataSource: text("other_data_source"),
		fieldAssessDate: timestamp("field_assess_date"),
		assessmentModes: text("assessment_modes"),
		originatorRecorderInst: text("originator_recorder_inst")
			.notNull()
			.default(""),
		validatedBy: text("validated_by").notNull().default(""),
		checkedBy: text("checked_by"),
		dataCollector: text("data_collector"),
		legacyData: jsonb("legacy_data"),
		spatialFootprint: jsonb("spatial_footprint"),
		attachments: jsonb("attachments"),
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
		updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
		createdAt: timestamp("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => ({
		// Composite unique constraint for tenant-scoped api_import_id
		disasterRecordsApiImportIdTenantUnique: unique(
			"disaster_records_api_import_id_tenant_unique",
		).on(table.apiImportId, table.countryAccountsId),
	}),
);

export const disasterRecordsRel = relations(
	disasterRecordsTable,
	({ one, many }) => ({
		countryAccount: one(countryAccountsTable, {
			fields: [disasterRecordsTable.countryAccountsId],
			references: [countryAccountsTable.id],
		}),

		//Relationship: Links each disaster record to a disaster event
		disasterEvent: one(disasterEventTable, {
			fields: [disasterRecordsTable.disasterEventId],
			references: [disasterEventTable.id],
		}),
		// Relationship: Enhances query efficiency by directly incorporating sector names
		// without the need for joining tables during retrieval
		relatedSectors: many(sectorDisasterRecordsRelationTable, {
			relationName: "sector_disaster_records_relation",
		}),

		hipHazard: one(hipHazardTable, {
			fields: [disasterRecordsTable.hipHazardId],
			references: [hipHazardTable.id],
		}),
		hipCluster: one(hipClusterTable, {
			fields: [disasterRecordsTable.hipClusterId],
			references: [hipClusterTable.id],
		}),
		hipType: one(hipTypeTable, {
			fields: [disasterRecordsTable.hipTypeId],
			references: [hipTypeTable.id],
		}),
	}),
);
