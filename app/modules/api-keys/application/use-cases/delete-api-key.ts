import type { ApiKeyRepositoryPort } from "~/modules/api-keys/domain/repositories/api-key-repository";

interface DeleteApiKeyInput {
	id: string;
	countryAccountsId: string;
}

export class DeleteApiKeyUseCase {
	constructor(private readonly repository: ApiKeyRepositoryPort) {}

	async execute(input: DeleteApiKeyInput): Promise<boolean> {
		const item = await this.repository.findById(input.id);
		if (!item || item.countryAccountsId !== input.countryAccountsId) {
			return false;
		}

		return this.repository.deleteById(input.id);
	}
}
