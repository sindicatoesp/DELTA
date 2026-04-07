import type { OrganizationActionResult } from "~/modules/organizations/application/action-result";
import { OrganizationDomainError } from "~/modules/organizations/domain/errors";
import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";

interface DeleteOrganizationInput {
	countryAccountsId: string;
	id: string;
}

export class DeleteOrganizationUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryPort,
	) {}

	async execute(
		input: DeleteOrganizationInput,
	): Promise<OrganizationActionResult> {
		if (!input.id) {
			return { ok: false, error: "Organization id is required" };
		}

		try {
			const existing = await this.organizationRepository.findById(input.id);
			if (!existing || existing.countryAccountsId !== input.countryAccountsId) {
				return { ok: false, error: "Organization not found" };
			}

			const deleted = await this.organizationRepository.deleteById(input.id);
			if (!deleted) {
				return { ok: false, error: "Unable to delete organization" };
			}

			return {
				ok: true,
				intent: "delete",
			};
		} catch (err) {
			if (err instanceof OrganizationDomainError) {
				return { ok: false, error: err.message };
			}
			throw err;
		}
	}
}
