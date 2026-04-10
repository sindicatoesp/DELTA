import { sql } from "drizzle-orm";
import { pgTable, text, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { countryAccountsTable } from "./countryAccountsTable";
import { userTable } from "./userTable";

////////////////////////////////////////////////////////
// Table to log all audit actions across the system

export const auditLogsTable = pgTable("audit_logs", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	tableName: text("table_name").notNull(),
	recordId: text("record_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	action: text("action").notNull(), // INSERT, UPDATE, DELETE
	oldValues: jsonb("old_values"),
	newValues: jsonb("new_values"),
	timestamp: timestamp("timestamp", { withTimezone: true })
		.defaultNow()
		.notNull(),
	countryAccountsId: uuid("country_accounts_id").references(
		() => countryAccountsTable.id,
		{
			onDelete: "cascade",
		},
	),
});
export type SelectAuditLogsTable = typeof auditLogsTable.$inferSelect;
export type InsertAuditLogsTable = typeof auditLogsTable.$inferInsert;

export type AuditLogsTableAction = "INSERT" | "UPDATE" | "DELETE";
