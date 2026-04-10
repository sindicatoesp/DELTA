import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	text,
	unique,
	timestamp,
} from "drizzle-orm/pg-core";
import { categoriesTable } from "./categoriesTable";
import { disasterRecordsTable } from "./disasterRecordsTable";

// Table for Non-economic losses

export const nonecoLossesTable = pgTable(
	"noneco_losses",
	{
		apiImportId: text("api_import_id"),
		id: uuid("id")
			.primaryKey()
			.default(sql`gen_random_uuid()`),
		disasterRecordId: uuid("disaster_record_id")
			.references((): AnyPgColumn => disasterRecordsTable.id)
			.notNull(),
		categoryId: uuid("category_id")
			.references((): AnyPgColumn => categoriesTable.id)
			.notNull(),
		description: text("description").notNull(),
		updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
		createdAt: timestamp("created_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => {
		return [
			unique("nonecolosses_sectorIdx").on(
				table.disasterRecordId,
				table.categoryId,
			),
		];
	},
);

export type SelectNonecoLosses = typeof nonecoLossesTable.$inferSelect;
export type InsertNonecoLosses = typeof nonecoLossesTable.$inferInsert;

export const nonecoLossesCategory_Rel = relations(
	nonecoLossesTable,
	({ one }) => ({
		category: one(categoriesTable, {
			fields: [nonecoLossesTable.categoryId],
			references: [categoriesTable.id],
		}),
	}),
);
