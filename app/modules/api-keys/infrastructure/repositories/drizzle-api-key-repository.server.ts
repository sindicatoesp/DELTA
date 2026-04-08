import { randomBytes } from "crypto";
import { desc, eq } from "drizzle-orm";
import { type Tx } from "~/db.server";
import {
	TokenAssignmentParser,
	ApiSecurityAudit,
} from "~/backend.server/models/api_key";
import type {
	ApiKeyViewItem,
	AssignableUserOption,
} from "~/modules/api-keys/domain/entities/api-key";
import type {
	ApiKeyRepositoryPort,
	ListApiKeysQuery,
} from "~/modules/api-keys/domain/repositories/api-key-repository";
import type { Dr } from "~/modules/api-keys/infrastructure/db/client.server";
import {
	apiKeyTable,
	userCountryAccountsTable,
	type SelectApiKey,
	type InsertApiKey,
} from "~/modules/api-keys/infrastructure/db/schema";

function generateSecret(): string {
	return randomBytes(32).toString("hex");
}

export class DrizzleApiKeyRepository implements ApiKeyRepositoryPort {
	private db: Dr;

	constructor(db: Dr) {
		this.db = db;
	}

	countByCountryAccountsId(countryAccountsId: string): Promise<number> {
		return this.db.$count(
			apiKeyTable,
			eq(apiKeyTable.countryAccountsId, countryAccountsId),
		);
	}

	async listByCountryAccountsId(
		query: ListApiKeysQuery,
	): Promise<ApiKeyViewItem[]> {
		const rows = await this.db.query.apiKeyTable.findMany({
			where: eq(apiKeyTable.countryAccountsId, query.countryAccountsId),
			orderBy: [desc(apiKeyTable.name)],
			offset: query.offset,
			limit: query.limit,
			with: {
				managedByUser: true,
			},
		});

		const enhancedRows = await Promise.all(
			rows.map(async (row) => {
				const auditResult = await ApiSecurityAudit.auditSingleKeyEnhanced(row);
				const assignment = TokenAssignmentParser.getTokenAssignment(row);

				return {
					id: row.id,
					name: row.name,
					secret: row.secret,
					createdAt: row.createdAt,
					managedByUserId: row.managedByUserId,
					managedByUser: { email: row.managedByUser?.email ?? "" },
					countryAccountsId: row.countryAccountsId ?? null,
					assignedUserId: assignment.assignedUserId,
					cleanName: assignment.cleanName,
					isActive: auditResult.issues.length === 0,
					tokenType: assignment.isUserAssigned
						? "user_assigned"
						: "admin_managed",
					issues: auditResult.issues,
					assignedUserEmail: auditResult.assignedUserEmail ?? null,
				} as ApiKeyViewItem;
			}),
		);

		return enhancedRows;
	}

	async findById(id: string): Promise<ApiKeyViewItem | null> {
		const row = await this.db.query.apiKeyTable.findFirst({
			where: eq(apiKeyTable.id, id),
			with: {
				managedByUser: true,
			},
		});
		if (!row) {
			return null;
		}

		const auditResult = await ApiSecurityAudit.auditSingleKeyEnhanced(row);
		const assignment = TokenAssignmentParser.getTokenAssignment(row);

		return {
			id: row.id,
			name: row.name,
			secret: row.secret,
			createdAt: row.createdAt,
			managedByUserId: row.managedByUserId,
			managedByUser: { email: row.managedByUser?.email ?? "" },
			countryAccountsId: row.countryAccountsId ?? null,
			assignedUserId: assignment.assignedUserId,
			cleanName: assignment.cleanName,
			isActive: auditResult.issues.length === 0,
			tokenType: assignment.isUserAssigned ? "user_assigned" : "admin_managed",
			issues: auditResult.issues,
			assignedUserEmail: auditResult.assignedUserEmail ?? null,
		};
	}

	create(data: {
		name: string;
		managedByUserId: string;
		countryAccountsId: string;
		assignedToUserId?: string;
	}): Promise<{ id: string } | null> {
		const name = data.assignedToUserId
			? `${data.name}__ASSIGNED_USER_${data.assignedToUserId}`
			: data.name;

		return this.db
			.insert(apiKeyTable)
			.values({
				createdAt: new Date(),
				name,
				managedByUserId: data.managedByUserId,
				countryAccountsId: data.countryAccountsId,
				secret: generateSecret(),
			})
			.returning({ id: apiKeyTable.id })
			.then((rows) => rows[0] ?? null);
	}

	updateNameById(id: string, name: string): Promise<void> {
		return this.db
			.update(apiKeyTable)
			.set({
				updatedAt: new Date(),
				name,
			})
			.where(eq(apiKeyTable.id, id))
			.then(() => undefined);
	}

	deleteById(id: string): Promise<boolean> {
		return this.db
			.delete(apiKeyTable)
			.where(eq(apiKeyTable.id, id))
			.returning({ id: apiKeyTable.id })
			.then((rows) => rows.length > 0);
	}

	async listAssignableUsers(
		countryAccountsId: string,
		currentUserId: string,
	): Promise<AssignableUserOption[]> {
		const rows = await this.db.query.userCountryAccountsTable.findMany({
			where: eq(userCountryAccountsTable.countryAccountsId, countryAccountsId),
			with: {
				user: true,
			},
		});

		return rows
			.filter((row) => row.user.emailVerified && row.user.id !== currentUserId)
			.map((row) => ({
				value: row.user.id,
				label: `${row.user.firstName} ${row.user.lastName} (${row.user.email})`,
			}));
	}

	// Legacy compatibility methods
	async delete(id: string, tx?: Tx) {
		const db = tx ?? this.db;
		return db.delete(apiKeyTable).where(eq(apiKeyTable.id, id));
	}

	async deleteByCountryAccountId(countryAccountsId: string, tx?: Tx) {
		const db = tx ?? this.db;
		return db
			.delete(apiKeyTable)
			.where(eq(apiKeyTable.countryAccountsId, countryAccountsId));
	}

	async getByCountryAccountsId(
		countryAccountsId: string,
		tx?: Tx,
	): Promise<SelectApiKey[]> {
		const db = tx ?? this.db;
		return db
			.select()
			.from(apiKeyTable)
			.where(eq(apiKeyTable.countryAccountsId, countryAccountsId));
	}

	async getBySecret(secret: string, tx?: Tx): Promise<SelectApiKey[]> {
		const db = tx ?? this.db;
		return db.select().from(apiKeyTable).where(eq(apiKeyTable.secret, secret));
	}

	async createMany(data: InsertApiKey[], tx?: Tx): Promise<SelectApiKey[]> {
		if (data.length === 0) return [];
		const db = tx ?? this.db;
		return db.insert(apiKeyTable).values(data).returning();
	}
}
