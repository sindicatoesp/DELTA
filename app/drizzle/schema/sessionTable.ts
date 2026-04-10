import { relations, sql } from "drizzle-orm";
import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { userTable } from "./userTable";

export const sessionTable = pgTable("session", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	userId: uuid("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	lastActiveAt: timestamp("last_active_at")
		.notNull()
		.default(sql`'2000-01-01T00:00:00.000Z'`),
	totpAuthed: boolean("totp_authed").notNull().default(false),
});

export type SelectSession = typeof sessionTable.$inferSelect;
export type InsertSession = typeof sessionTable.$inferInsert;

export const sessionsRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}));
