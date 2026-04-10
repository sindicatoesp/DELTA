import { sql } from "drizzle-orm";
import { pgTable, uuid, unique, text, timestamp } from "drizzle-orm/pg-core";
import { countryAccountsTable } from "./countryAccountsTable";

export const organizationTable = pgTable(
	"organization",
	{
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		name: text("name").notNull().default(""),
		updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
		createdAt: timestamp("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		apiImportId: text("api_import_id"),
		countryAccountsId: uuid("country_accounts_id").references(
			() => countryAccountsTable.id,
			{
				onDelete: "cascade",
			},
		),
	},
	(table) => [
		unique("organization___api_import_id_country_accounts_id").on(
			table.name,
			table.apiImportId,
			table.countryAccountsId,
		),
	],
);

export type SelectOrganization = typeof organizationTable.$inferSelect;
export type InsertOrganization = typeof organizationTable.$inferInsert;
