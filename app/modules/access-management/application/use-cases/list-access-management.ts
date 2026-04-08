import { paginationQueryFromURL } from "~/frontend/pagination/api.server";
import type { AccessManagementRepositoryPort } from "~/modules/access-management/domain/repositories/access-management-repository";

type OrganizationOption = {
	id: string;
	name: string;
};

interface OrganizationRepositoryPort {
	getByCountryAccountsId(
		countryAccountsId: string,
	): Promise<OrganizationOption[]>;
}

interface ListAccessManagementInput {
	request: Request;
	countryAccountsId: string;
	userRole: string | null;
}

export class ListAccessManagementUseCase {
	constructor(
		private readonly accessManagementRepository: AccessManagementRepositoryPort,
		private readonly organizationRepository: OrganizationRepositoryPort,
	) {}

	async execute(input: ListAccessManagementInput) {
		const url = new URL(input.request.url);
		const search = url.searchParams.get("search") || "";
		const pagination = paginationQueryFromURL(input.request, []);

		const [organizations, usersResult] = await Promise.all([
			this.organizationRepository.getByCountryAccountsId(
				input.countryAccountsId,
			),
			this.accessManagementRepository.listUsersByCountryAccountsId({
				countryAccountsId: input.countryAccountsId,
				offset: pagination.query.skip,
				limit: pagination.query.take,
			}),
		]);

		return {
			items: usersResult.items,
			pagination: {
				total: usersResult.total,
				pageNumber: pagination.viewData.page,
				pageSize: pagination.viewData.pageSize,
				totalPages: Math.ceil(usersResult.total / pagination.viewData.pageSize),
				extraParams: {},
			},
			organizations,
			search,
			userRole: input.userRole ?? undefined,
		};
	}
}
