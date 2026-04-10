import { sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	boolean,
	jsonb,
	bigint,
} from "drizzle-orm/pg-core";
import { humanDsgConfigTable } from "./humanDsgConfigTable";
import { disasterRecordsTable } from "./disasterRecordsTable";

export const humanCategoryPresenceTable = pgTable("human_category_presence", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	recordId: uuid("record_id")
		.references((): AnyPgColumn => disasterRecordsTable.id)
		.notNull(),
	deaths: boolean("deaths"),
	injured: boolean("injured"),
	missing: boolean("missing"),
	affectedDirect: boolean("affected_direct"),
	affectedIndirect: boolean("affected_indirect"),
	displaced: boolean("displaced"),

	deathsTotal: bigint("deaths_total", { mode: "number" }),
	injuredTotal: bigint("injured_total", { mode: "number" }),
	missingTotal: bigint("missing_total", { mode: "number" }),
	affectedDirectTotal: bigint("affected_direct_total", { mode: "number" }),
	affectedIndirectTotal: bigint("affected_indirect_total", { mode: "number" }),
	displacedTotal: bigint("displaced_total", { mode: "number" }),

	deathsTotalGroupColumnNames: jsonb("deaths_total_group_column_names"),
	injuredTotalGroupColumnNames: jsonb("injured_total_group_column_names"),
	missingTotalGroupColumnNames: jsonb("missing_total_group_column_names"),
	affectedTotalGroupColumnNames: jsonb("affected_total_group_column_names"),
	displacedTotalGroupColumnNames: jsonb("displaced_total_group_column_names"),
});

export type SelectHumanCategoryPresence =
	typeof humanDsgConfigTable.$inferSelect;
export type InsertHumanCategoryPresence =
	typeof humanDsgConfigTable.$inferInsert;
