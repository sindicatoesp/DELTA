export type ApiKeyTokenType = "user_assigned" | "admin_managed";

export interface ApiKeyListItem {
	id: string;
	secret: string;
	name: string;
	createdAt: Date;
	managedByUserId: string;
	managedByUser: { email: string };
	assignedUserId: string | null;
	cleanName: string;
	isActive: boolean;
	issues: string[];
	tokenType: ApiKeyTokenType;
}

export interface ApiKeyViewItem extends ApiKeyListItem {
	countryAccountsId: string | null;
	assignedUserEmail: string | null;
}

export interface AssignableUserOption {
	value: string;
	label: string;
}

export interface ApiKeysPagination {
	totalItems: number;
	itemsOnThisPage: number;
	page: number;
	pageSize: number;
	extraParams: Record<string, string[]>;
}

export interface ApiKeysListResult {
	items: ApiKeyListItem[];
	pagination: ApiKeysPagination;
}
