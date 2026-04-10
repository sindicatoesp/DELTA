import { sql } from "drizzle-orm";
import { pgTable, uuid, AnyPgColumn, integer } from "drizzle-orm/pg-core";
import { humanDsgTable } from "./humanDsgTable";

export const deathsTable = pgTable("deaths", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	dsgId: uuid("dsg_id")
		.references((): AnyPgColumn => humanDsgTable.id)
		.notNull(),
	deaths: integer("deaths"),
});

export type SelectDeaths = typeof deathsTable.$inferSelect;
export type InsertDeaths = typeof deathsTable.$inferInsert;
