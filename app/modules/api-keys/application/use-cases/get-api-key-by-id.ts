import type { ApiKeyViewItem } from "~/modules/api-keys/domain/entities/api-key";
import type { ApiKeyRepositoryPort } from "~/modules/api-keys/domain/repositories/api-key-repository";

interface GetApiKeyByIdInput {
	id: string;
	countryAccountsId: string;
	requestingUserId: string;
}

export class GetApiKeyByIdUseCase {
	constructor(private readonly repository: ApiKeyRepositoryPort) {}

	async execute(input: GetApiKeyByIdInput): Promise<ApiKeyViewItem | null> {
		const item = await this.repository.findById(input.id);
		if (!item) {
			return null;
		}

		if (item.countryAccountsId !== input.countryAccountsId) {
			return null;
		}

		if (item.managedByUserId !== input.requestingUserId) {
			return {
				...item,
				secret: "Secret is only visible to the user who owns this API key",
			};
		}

		return item;
	}
}
