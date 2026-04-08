import type {
	ApiKeyViewItem,
	AssignableUserOption,
} from "~/modules/api-keys/domain/entities/api-key";

export interface ListApiKeysQuery {
	countryAccountsId: string;
	offset: number;
	limit: number;
}

export interface ApiKeyRepositoryPort {
	countByCountryAccountsId(countryAccountsId: string): Promise<number>;
	listByCountryAccountsId(query: ListApiKeysQuery): Promise<ApiKeyViewItem[]>;
	findById(id: string): Promise<ApiKeyViewItem | null>;
	create(data: {
		name: string;
		managedByUserId: string;
		countryAccountsId: string;
		assignedToUserId?: string;
	}): Promise<{ id: string } | null>;
	updateNameById(id: string, name: string): Promise<void>;
	deleteById(id: string): Promise<boolean>;
	listAssignableUsers(
		countryAccountsId: string,
		currentUserId: string,
	): Promise<AssignableUserOption[]>;
}
