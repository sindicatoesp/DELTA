import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { countryAccountsTable } from "~/drizzle/schema/countryAccountsTable";

export const organizations = pgTable(
	"organization",
	{
		id: uuid("id").primaryKey().defaultRandom(),
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

export type OrganizationRecord = typeof organizations.$inferSelect;
export type InsertOrganizationRecord = typeof organizations.$inferInsert;
