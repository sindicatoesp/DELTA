import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";

interface GetOrganizationByIdInput {
	id: string;
	countryAccountsId: string;
}

export class GetOrganizationByIdUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryPort,
	) {}

	async execute(input: GetOrganizationByIdInput) {
		const organization = await this.organizationRepository.findById(input.id);

		if (
			!organization ||
			organization.countryAccountsId !== input.countryAccountsId
		) {
			return null;
		}

		return organization;
	}
}
