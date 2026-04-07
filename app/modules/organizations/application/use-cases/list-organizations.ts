import type { OrganizationRepositoryPort } from "~/modules/organizations/domain/repositories/organization-repository";

interface ListOrganizationsUseCaseInput {
	countryAccountsId: string;
	page: number;
	pageSize: number;
	search: string;
}

export class ListOrganizationsUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryPort,
	) {}

	async execute(input: ListOrganizationsUseCaseInput) {
		const data = await this.organizationRepository.listByCountryAccountsId({
			countryAccountsId: input.countryAccountsId,
			search: input.search,
			pagination: {
				page: input.page,
				pageSize: input.pageSize,
			},
		});

		return {
			filters: { search: input.search },
			data,
		};
	}
}
