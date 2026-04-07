import type { OrganizationActionResult } from "~/modules/organizations/application/action-result";
import { OrganizationDomainError } from "~/modules/organizations/domain/errors";
import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";

interface UpdateOrganizationInput {
	countryAccountsId: string;
	id: string;
	name: string;
}

export class UpdateOrganizationUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryPort,
	) {}

	async execute(
		input: UpdateOrganizationInput,
	): Promise<OrganizationActionResult> {
		const name = input.name.trim();

		if (!input.id) {
			return { ok: false, error: "Organization id is required" };
		}

		if (!name) {
			return {
				ok: false,
				error: "Name is required",
			};
		}

		try {
			const existing = await this.organizationRepository.findById(input.id);
			if (!existing || existing.countryAccountsId !== input.countryAccountsId) {
				return { ok: false, error: "Organization not found" };
			}

			const duplicate =
				await this.organizationRepository.findByNameAndCountryAccountsId(
					name,
					input.countryAccountsId,
				);
			if (duplicate && duplicate.id !== input.id) {
				return {
					ok: false,
					error: "An organization with this name already exists",
				};
			}

			const updated = await this.organizationRepository.updateById(input.id, {
				name,
			});
			if (!updated) {
				return { ok: false, error: "Unable to update organization" };
			}

			return {
				ok: true,
				intent: "update",
			};
		} catch (err) {
			if (err instanceof OrganizationDomainError) {
				return { ok: false, error: err.message };
			}
			throw err;
		}
	}
}
