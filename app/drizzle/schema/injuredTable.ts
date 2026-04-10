import { sql } from "drizzle-orm";
import { pgTable, uuid, AnyPgColumn, integer } from "drizzle-orm/pg-core";
import { humanDsgTable } from "./humanDsgTable";

export const injuredTable = pgTable("injured", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	dsgId: uuid("dsg_id")
		.references((): AnyPgColumn => humanDsgTable.id)
		.notNull(),
	injured: integer("injured"),
});

export type SelectInjured = typeof injuredTable.$inferSelect;
export type InsertInjured = typeof injuredTable.$inferInsert;
