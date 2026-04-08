import type { ApiKeysListResult } from "~/modules/api-keys/domain/entities/api-key";
import type { ApiKeyRepositoryPort } from "~/modules/api-keys/domain/repositories/api-key-repository";

interface ListApiKeysInput {
	countryAccountsId: string;
	page: number;
	pageSize: number;
}

export class ListApiKeysUseCase {
	constructor(private readonly repository: ApiKeyRepositoryPort) {}

	async execute(input: ListApiKeysInput): Promise<ApiKeysListResult> {
		const offset = (input.page - 1) * input.pageSize;
		const [totalItems, items] = await Promise.all([
			this.repository.countByCountryAccountsId(input.countryAccountsId),
			this.repository.listByCountryAccountsId({
				countryAccountsId: input.countryAccountsId,
				offset,
				limit: input.pageSize,
			}),
		]);

		return {
			items,
			pagination: {
				totalItems,
				itemsOnThisPage: items.length,
				page: input.page,
				pageSize: input.pageSize,
				extraParams: {},
			},
		};
	}
}
