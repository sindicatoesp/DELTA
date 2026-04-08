import { PERMISSIONS, roleHasPermission } from "~/frontend/user/roles";
import type {
	ApiKeyViewItem,
	AssignableUserOption,
} from "~/modules/api-keys/domain/entities/api-key";
import type { ApiKeyRepositoryPort } from "~/modules/api-keys/domain/repositories/api-key-repository";

interface GetApiKeyFormDataInput {
	id?: string;
	countryAccountsId: string;
	currentUserId: string;
	userRole: string | null;
}

interface GetApiKeyFormDataResult {
	item: ApiKeyViewItem | null;
	userOptions: AssignableUserOption[];
	isAdmin: boolean;
}

export class GetApiKeyFormDataUseCase {
	constructor(private readonly repository: ApiKeyRepositoryPort) {}

	async execute(
		input: GetApiKeyFormDataInput,
	): Promise<GetApiKeyFormDataResult> {
		const isAdmin =
			roleHasPermission(input.userRole, PERMISSIONS.API_KEYS_CREATE) ||
			roleHasPermission(input.userRole, PERMISSIONS.API_KEYS_UPDATE);
		let item: ApiKeyViewItem | null = null;

		if (input.id && input.id !== "new") {
			item = await this.repository.findById(input.id);
			if (item?.countryAccountsId !== input.countryAccountsId) {
				item = null;
			}
		}

		const userOptions = isAdmin
			? await this.repository.listAssignableUsers(
					input.countryAccountsId,
					input.currentUserId,
				)
			: [];

		return {
			item,
			userOptions,
			isAdmin,
		};
	}
}
