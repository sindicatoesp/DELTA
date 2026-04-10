import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { countryAccountsTable } from "./countryAccountsTable";
import { userTable } from "./userTable";

export const apiKeyTable = pgTable("api_key", {
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
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
export type ApiKeyWithUser = SelectApiKey & {
	managedByUser: {
		id: string;
		email: string;
	};
};

export const apiKeyRelations = relations(apiKeyTable, ({ one }) => ({
	managedByUser: one(userTable, {
		fields: [apiKeyTable.managedByUserId],
		references: [userTable.id],
	}),
}));
