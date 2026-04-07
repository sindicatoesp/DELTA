import { OrganizationDomainError } from "~/modules/organizations/domain/errors";
import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";
import { OrganizationQueries } from "~/modules/organizations/infrastructure/db/organization-queries";
import type { Dr } from "~/modules/organizations/infrastructure/db/client.server";

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
	private queries: OrganizationQueries;

	constructor(db: Dr) {
		this.queries = new OrganizationQueries(db);
	}

	async create(data: { name: string; countryAccountsId: string }) {
		try {
			const created = await this.queries.create(data);
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
		const organization = await this.queries.findById(id);
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
		const organization = await this.queries.findByNameAndCountryAccountsId(
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
			const updated = await this.queries.updateById(id, data);
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
			const deleted = await this.queries.deleteById(id);
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
		const result = await this.queries.listByCountryAccountsId(args);
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
}
