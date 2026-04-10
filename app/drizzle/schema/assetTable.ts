import { sql } from "drizzle-orm";
import {
	pgTable,
	text,
	boolean,
	uuid,
	unique,
	jsonb,
} from "drizzle-orm/pg-core";
import { countryAccountsTable } from "./countryAccountsTable";

///////////////////////////////////////////////

export const assetTable = pgTable(
	"asset",
	{
		apiImportId: text("api_import_id"),
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		sectorIds: text("sector_ids").notNull(),
		isBuiltIn: boolean("is_built_in").notNull(),

		builtInName: jsonb("built_in_name")
			.$type<Record<string, string>>()
			.default({})
			.notNull(),
		customName: text("custom_name"),

		builtInCategory: jsonb("built_in_category")
			.$type<Record<string, string>>()
			.default({})
			.notNull(),
		customCategory: text("custom_category"),

		nationalId: text("national_id"),

		builtInNotes: jsonb("built_in_notes")
			.$type<Record<string, string>>()
			.default({})
			.notNull(),
		customNotes: text("custom_notes"),

		countryAccountsId: uuid("country_accounts_id").references(
			() => countryAccountsTable.id,
			{
				onDelete: "cascade",
			},
		),
	},
	(table) => ({
		// Composite unique constraint for tenant-scoped api_import_id
		assetApiImportIdTenantUnique: unique(
			"asset_api_import_id_tenant_unique",
		).on(table.apiImportId, table.countryAccountsId),
	}),
);

export const assetTableConstraints = {
	assetId: "damages_asset_id_asset_id_fk",
};

export type SelectAsset = typeof assetTable.$inferSelect;
export type InsertAsset = typeof assetTable.$inferInsert;
