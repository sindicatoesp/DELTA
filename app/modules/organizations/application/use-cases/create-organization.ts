import type { OrganizationActionResult } from "~/modules/organizations/application/action-result";
import { OrganizationDomainError } from "~/modules/organizations/domain/errors";
import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";

interface CreateOrganizationInput {
	countryAccountsId: string;
	name: string;
}

export class CreateOrganizationUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryPort,
	) {}

	async execute(
		input: CreateOrganizationInput,
	): Promise<OrganizationActionResult> {
		const name = input.name.trim();

		if (!name) {
			return {
				ok: false,
				error: "Name is required",
			};
		}

		try {
			const duplicate =
				await this.organizationRepository.findByNameAndCountryAccountsId(
					name,
					input.countryAccountsId,
				);

			if (duplicate) {
				return {
					ok: false,
					error: "An organization with this name already exists",
				};
			}

			const created = await this.organizationRepository.create({
				name,
				countryAccountsId: input.countryAccountsId,
			});

			if (!created) {
				return { ok: false, error: "Unable to create organization" };
			}

			return {
				ok: true,
				intent: "create",
			};
		} catch (err) {
			if (err instanceof OrganizationDomainError) {
				return { ok: false, error: err.message };
			}
			throw err;
		}
	}
}
