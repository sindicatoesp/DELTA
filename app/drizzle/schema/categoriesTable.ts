import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	uuid,
	AnyPgColumn,
	jsonb,
	bigint,
	timestamp,
} from "drizzle-orm/pg-core";

/////////////////////////////////////////////////////////
// Table for generic classification categories

export const categoriesTable = pgTable("categories", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: jsonb("name").$type<Record<string, string>>().default({}).notNull(),
	parentId: uuid("parent_id").references((): AnyPgColumn => categoriesTable.id),
	level: bigint("level", { mode: "number" }).notNull().default(1),
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});
export type SelectCategories = typeof categoriesTable.$inferSelect;

export const categoryCategoryParent_Rel = relations(
	categoriesTable,
	({ one }) => ({
		categoryParent: one(categoriesTable, {
			fields: [categoriesTable.parentId],
			references: [categoriesTable.id],
		}),
	}),
);
