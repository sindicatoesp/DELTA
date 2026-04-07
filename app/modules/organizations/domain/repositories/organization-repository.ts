import type {
	Organization,
	OrganizationListItem,
} from "~/modules/organizations/domain/entities/organization";

export interface OrganizationPagination {
	totalItems: number;
	itemsOnThisPage: number;
	page: number;
	pageSize: number;
	extraParams: Record<string, string[]>;
}

export interface ListOrganizationsQuery {
	countryAccountsId: string;
	search?: string;
	pagination: {
		page: number;
		pageSize: number;
	};
}

export interface ListOrganizationsResult {
	items: OrganizationListItem[];
	pagination: OrganizationPagination;
}

export interface OrganizationRepositoryPort {
	create(data: {
		name: string;
		countryAccountsId: string;
	}): Promise<Organization | null>;
	findById(id: string): Promise<Organization | null>;
	findByNameAndCountryAccountsId(
		name: string,
		countryAccountsId: string,
	): Promise<Organization | null>;
	updateById(id: string, data: { name: string }): Promise<Organization | null>;
	deleteById(id: string): Promise<Organization | null>;
	listByCountryAccountsId(
		args: ListOrganizationsQuery,
	): Promise<ListOrganizationsResult>;
}
