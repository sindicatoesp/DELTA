import { sql } from "drizzle-orm";
import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";

////////////////////////////////////////////////////////////////

export const superAdminUsersTable = pgTable("super_admin_users", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	firstName: varchar("first_name", { length: 150 }),
	lastName: varchar("last_name", { length: 150 }),
	email: varchar("email", { length: 254 }).notNull().unique(),
	password: varchar("password", { length: 100 }).notNull(),
});

export type SelectSuperAdmins = typeof superAdminUsersTable.$inferSelect;
export type InsertSuperAdmins = typeof superAdminUsersTable.$inferInsert;
