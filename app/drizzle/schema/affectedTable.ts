import { sql } from "drizzle-orm";
import { pgTable, uuid, AnyPgColumn, integer } from "drizzle-orm/pg-core";
import { humanDsgTable } from "./humanDsgTable";

export const affectedTable = pgTable("affected", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	dsgId: uuid("dsg_id")
		.references((): AnyPgColumn => humanDsgTable.id)
		.notNull(),
	direct: integer("direct"),
	indirect: integer("indirect"),
});
export type SelectAffected = typeof affectedTable.$inferSelect;
export type InsertAffected = typeof affectedTable.$inferInsert;
