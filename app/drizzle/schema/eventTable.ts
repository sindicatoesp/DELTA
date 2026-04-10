import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { disasterEventTable } from "./disasterEventTable";
import { hazardousEventTable } from "../../modules/hazardous-event/infrastructure/db/schema";
import { eventRelationshipTable } from "./eventRelationshipTable";

export const eventTable = pgTable("event", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	name: text("name").notNull().default("").notNull(),
	description: text("description").notNull().default("").notNull(),
});

export type Event = typeof eventTable.$inferSelect;
export type EventInsert = typeof eventTable.$inferInsert;

export const eventRel = relations(eventTable, ({ one, many }) => ({
	// hazard event
	he: one(hazardousEventTable, {
		fields: [eventTable.id],
		references: [hazardousEventTable.id],
	}),
	// disaster event
	de: one(disasterEventTable, {
		fields: [eventTable.id],
		references: [disasterEventTable.id],
	}),
	// parents
	ps: many(eventRelationshipTable, { relationName: "c" }),
	// children
	cs: many(eventRelationshipTable, { relationName: "p" }),
}));
