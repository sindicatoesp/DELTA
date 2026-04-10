import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { userCountryAccountsTable } from "./userCountryAccountsTable";

export const userTable = pgTable("user", {
	id: uuid("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	firstName: text("first_name").notNull().default(""),
	lastName: text("last_name").notNull().default(""),
	email: text("email").notNull().unique(),
	password: text("password").notNull().default(""),
	emailVerified: boolean("email_verified").notNull().default(false),
	inviteCode: text("invite_code").notNull().default(""),
	inviteSentAt: timestamp("invite_sent_at"),
	inviteExpiresAt: timestamp("invite_expires_at")
		.notNull()
		.default(sql`'2000-01-01T00:00:00.000Z'`),
	resetPasswordToken: text("reset_password_token").notNull().default(""),
	resetPasswordExpiresAt: timestamp("reset_password_expires_at")
		.notNull()
		.default(sql`'2000-01-01T00:00:00.000Z'`),
	totpEnabled: boolean("totp_enabled").notNull().default(false),
	totpSecret: text("totp_secret").notNull().default(""),
	totpSecretUrl: text("totp_secret_url").notNull().default(""),
	hydrometCheUser: boolean("hydromet_che_user").notNull().default(false),
	authType: text("auth_type").notNull().default("form"),
	updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export const userRelations = relations(userTable, ({ many }) => ({
	userCountryAccounts: many(userCountryAccountsTable),
}));
