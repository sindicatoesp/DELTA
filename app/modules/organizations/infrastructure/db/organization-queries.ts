import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import {
	organizationTable,
	type InsertOrganization,
	type SelectOrganization,
} from "~/drizzle/schema/organizationTable";
import { isValidUUID } from "~/utils/id";
import type { Dr } from "./client.server";

type OrganizationCountryAccountsId = NonNullable<
	SelectOrganization["countryAccountsId"]
>;

interface ListByCountryAccountsIdArgs {
	countryAccountsId: OrganizationCountryAccountsId;
	search?: string;
	pagination: {
		page: number;
		pageSize: number;
	};
}

export class OrganizationQueries {
	constructor(private readonly db: Dr) {}

	async create(data: Omit<InsertOrganization, "id" | "createdAt">) {
		const rows = await this.db
			.insert(organizationTable)
			.values(data)
			.returning();
		return rows[0] ?? null;
	}

	async findById(id: SelectOrganization["id"]) {
		return this.db.query.organizationTable.findFirst({
			where: eq(organizationTable.id, id),
		});
	}

	async findByNameAndCountryAccountsId(
		name: string,
		countryAccountsId: OrganizationCountryAccountsId,
	) {
		return this.db.query.organizationTable.findFirst({
			where: and(
				eq(organizationTable.name, name),
				eq(organizationTable.countryAccountsId, countryAccountsId),
			),
		});
	}

	async updateById(
		id: string,
		data: Partial<Omit<InsertOrganization, "id" | "createdAt" | "updatedAt">>,
	) {
		const rows = await this.db
			.update(organizationTable)
			.set(data)
			.where(eq(organizationTable.id, id))
			.returning();
		return rows[0] ?? null;
	}

	async deleteById(id: SelectOrganization["id"]) {
		const rows = await this.db
			.delete(organizationTable)
			.where(eq(organizationTable.id, id))
			.returning();
		return rows[0] ?? null;
	}

	async listByCountryAccountsId(args: ListByCountryAccountsIdArgs) {
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

		const conditions = [
			eq(organizationTable.countryAccountsId, countryAccountsId),
		];
		if (search) {
			const searchIlike = `%${search}%`;
			conditions.push(
				or(
					sql`${organizationTable.id}::text ILIKE ${searchIlike}`,
					ilike(organizationTable.name, searchIlike),
				)!,
			);
		}
		const where = and(...conditions);

		const totalItems = await this.db.$count(organizationTable, where);
		const items = await this.db.query.organizationTable.findMany({
			offset,
			limit: pageSize,
			columns: {
				id: true,
				name: true,
			},
			orderBy: [asc(organizationTable.name)],
			where,
		});

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
