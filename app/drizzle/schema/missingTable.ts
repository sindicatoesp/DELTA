import { sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	timestamp,
	integer,
} from "drizzle-orm/pg-core";
import { humanDsgTable } from "./humanDsgTable";

export const missingTable = pgTable("missing", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	dsgId: uuid("dsg_id")
		.references((): AnyPgColumn => humanDsgTable.id)
		.notNull(),
	asOf: timestamp("as_of"),
	missing: integer("missing"),
});

export type SelectMissing = typeof missingTable.$inferSelect;
export type InsertMissing = typeof missingTable.$inferInsert;
