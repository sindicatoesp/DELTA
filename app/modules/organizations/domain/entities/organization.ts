export interface Organization {
	id: string;
	name: string;
	countryAccountsId: string;
}

export type OrganizationListItem = Pick<Organization, "id" | "name">;
