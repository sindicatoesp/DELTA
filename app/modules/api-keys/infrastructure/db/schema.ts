import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { countryAccountsTable } from "~/drizzle/schema/countryAccountsTable";
import { userTable } from "~/drizzle/schema/userTable";

export const apiKeyTable = pgTable("api_key", {
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	id: uuid("id").primaryKey().defaultRandom(),
	secret: text("secret").notNull().unique(),
	name: text("name").notNull().default(""),
	managedByUserId: uuid("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	countryAccountsId: uuid("country_accounts_id").references(
		() => countryAccountsTable.id,
		{
			onDelete: "cascade",
		},
	),
});

export type SelectApiKey = typeof apiKeyTable.$inferSelect;
export type InsertApiKey = typeof apiKeyTable.$inferInsert;

export {
	userCountryAccountsTable,
	type SelectUserCountryAccounts,
} from "~/drizzle/schema/userCountryAccountsTable";
