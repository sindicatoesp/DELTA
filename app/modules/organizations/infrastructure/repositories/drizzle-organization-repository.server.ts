import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import type { Tx } from "~/db.server";
import { OrganizationDomainError } from "~/modules/organizations/domain/errors";
import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";
import type { Dr } from "~/modules/organizations/infrastructure/db/client.server";
import {
	organizations,
	type InsertOrganizationRecord,
	type OrganizationRecord,
} from "~/modules/organizations/infrastructure/db/schema";
import { isValidUUID } from "~/utils/id";

function mapDbError(err: unknown): never {
	const error = err as {
		code?: string;
		message?: string;
		cause?: { code?: string; message?: string };
	};
	const dbCode = error?.code ?? error?.cause?.code;
	const dbMessage = String(error?.message ?? error?.cause?.message ?? "");

	if (
		dbCode === "23503" ||
		/foreign key constraint|violates foreign key/i.test(dbMessage)
	) {
		throw new OrganizationDomainError(
			"This organization cannot be deleted because it is still being used by one or more users. Remove those assignments first.",
		);
	}

	if (dbCode === "23505") {
		throw new OrganizationDomainError(
			"An organization with the same name already exists.",
		);
	}

	throw new OrganizationDomainError(
		err instanceof Error ? err.message : "Unknown error",
	);
}

export class DrizzleOrganizationRepository implements OrganizationRepositoryPort {
	private db: Dr;

	constructor(db: Dr) {
		this.db = db;
	}

	async create(data: { name: string; countryAccountsId: string }) {
		try {
			const created = await this.createRecord(data);
			if (!created || !created.countryAccountsId) {
				return null;
			}
			return {
				id: created.id,
				name: created.name,
				countryAccountsId: created.countryAccountsId,
			};
		} catch (err) {
			mapDbError(err);
		}
	}

	async findById(id: string) {
		const organization = await this.findRecordById(id);
		if (!organization || !organization.countryAccountsId) {
			return null;
		}
		return {
			id: organization.id,
			name: organization.name,
			countryAccountsId: organization.countryAccountsId,
		};
	}

	async findByNameAndCountryAccountsId(
		name: string,
		countryAccountsId: string,
	) {
		const organization = await this.findRecordByNameAndCountryAccountsId(
			name,
			countryAccountsId,
		);
		if (!organization || !organization.countryAccountsId) {
			return null;
		}
		return {
			id: organization.id,
			name: organization.name,
			countryAccountsId: organization.countryAccountsId,
		};
	}

	async updateById(id: string, data: { name: string }) {
		try {
			const updated = await this.updateRecordById(id, data);
			if (!updated || !updated.countryAccountsId) {
				return null;
			}
			return {
				id: updated.id,
				name: updated.name,
				countryAccountsId: updated.countryAccountsId,
			};
		} catch (err) {
			mapDbError(err);
		}
	}

	async deleteById(id: string) {
		try {
			const deleted = await this.deleteRecordById(id);
			if (!deleted || !deleted.countryAccountsId) {
				return null;
			}
			return {
				id: deleted.id,
				name: deleted.name,
				countryAccountsId: deleted.countryAccountsId,
			};
		} catch (err) {
			mapDbError(err);
		}
	}

	async listByCountryAccountsId(args: {
		countryAccountsId: string;
		search?: string;
		pagination: { page: number; pageSize: number };
	}) {
		const result = await this.listRecordsByCountryAccountsId(args);
		const normalizedExtraParams: Record<string, string[]> = {};

		for (const [key, value] of Object.entries(
			result.pagination.extraParams ?? {},
		)) {
			if (Array.isArray(value)) {
				normalizedExtraParams[key] = value;
			}
		}

		return {
			items: result.items,
			pagination: {
				...result.pagination,
				extraParams: normalizedExtraParams,
			},
		};
	}

	private async createRecord(
		data: Omit<InsertOrganizationRecord, "id" | "createdAt">,
		tx?: Tx,
	) {
		const db = tx ?? this.db;
		const rows = await db.insert(organizations).values(data).returning();
		return rows[0] ?? null;
	}

	async createMany(data: InsertOrganizationRecord[], tx?: Tx) {
		if (data.length === 0) {
			return [];
		}
		const db = tx ?? this.db;
		return db.insert(organizations).values(data).returning();
	}

	async getByCountryAccountsId(countryAccountsId: string, tx?: Tx) {
		if (!isValidUUID(countryAccountsId)) {
			throw new Error(`Invalid UUID: ${countryAccountsId}`);
		}
		const db = tx ?? this.db;
		return db
			.select()
			.from(organizations)
			.where(eq(organizations.countryAccountsId, countryAccountsId))
			.execute();
	}

	deleteByCountryAccountId(countryAccountsId: string, tx?: Tx) {
		const db = tx ?? this.db;
		return db
			.delete(organizations)
			.where(eq(organizations.countryAccountsId, countryAccountsId));
	}

	private async findRecordById(id: OrganizationRecord["id"]) {
		const rows = await this.db
			.select()
			.from(organizations)
			.where(eq(organizations.id, id))
			.limit(1);
		return rows[0] ?? null;
	}

	private async findRecordByNameAndCountryAccountsId(
		name: string,
		countryAccountsId: NonNullable<OrganizationRecord["countryAccountsId"]>,
	) {
		const rows = await this.db
			.select()
			.from(organizations)
			.where(
				and(
					eq(organizations.name, name),
					eq(organizations.countryAccountsId, countryAccountsId),
				),
			)
			.limit(1);
		return rows[0] ?? null;
	}

	private async updateRecordById(
		id: string,
		data: Partial<
			Omit<InsertOrganizationRecord, "id" | "createdAt" | "updatedAt">
		>,
	) {
		const rows = await this.db
			.update(organizations)
			.set(data)
			.where(eq(organizations.id, id))
			.returning();
		return rows[0] ?? null;
	}

	private async deleteRecordById(id: OrganizationRecord["id"]) {
		const rows = await this.db
			.delete(organizations)
			.where(eq(organizations.id, id))
			.returning();
		return rows[0] ?? null;
	}

	private async listRecordsByCountryAccountsId(args: {
		countryAccountsId: string;
		search?: string;
		pagination: {
			page: number;
			pageSize: number;
		};
	}) {
		const { countryAccountsId, pagination } = args;
		const search = (args.search ?? "").trim();

		if (!isValidUUID(countryAccountsId)) {
			throw new Error(`Invalid UUID: ${countryAccountsId}`);
		}

		const page = Number.isFinite(pagination.page)
			? Math.max(1, Math.trunc(pagination.page))
			: 1;
		const pageSize = Number.isFinite(pagination.pageSize)
			? Math.max(1, Math.trunc(pagination.pageSize))
			: 50;
		const offset = (page - 1) * pageSize;

		const conditions = [eq(organizations.countryAccountsId, countryAccountsId)];
		if (search) {
			const searchIlike = `%${search}%`;
			conditions.push(
				or(
					sql`${organizations.id}::text ILIKE ${searchIlike}`,
					ilike(organizations.name, searchIlike),
				)!,
			);
		}
		const where = and(...conditions);

		const totalItems = await this.db.$count(organizations, where);
		const items = await this.db
			.select({
				id: organizations.id,
				name: organizations.name,
			})
			.from(organizations)
			.where(where)
			.orderBy(asc(organizations.name))
			.offset(offset)
			.limit(pageSize);

		return {
			items,
			pagination: {
				totalItems,
				itemsOnThisPage: items.length,
				page,
				pageSize,
				extraParams: search ? { search: [search] } : {},
			},
		};
	}
}
