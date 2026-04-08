import type { ApiKeyRepositoryPort } from "~/modules/api-keys/domain/repositories/api-key-repository";

interface SaveApiKeyInput {
	id: string | null;
	countryAccountsId: string;
	managedByUserId: string;
	name: string;
	assignedToUserId?: string;
}

export class SaveApiKeyUseCase {
	constructor(private readonly repository: ApiKeyRepositoryPort) {}

	async execute(input: SaveApiKeyInput): Promise<{ id: string }> {
		const normalizedName = input.name.trim();
		const finalName = input.assignedToUserId
			? `${normalizedName}__ASSIGNED_USER_${input.assignedToUserId}`
			: normalizedName;

		if (!input.id || input.id === "new") {
			const created = await this.repository.create({
				name: normalizedName,
				countryAccountsId: input.countryAccountsId,
				managedByUserId: input.managedByUserId,
				assignedToUserId: input.assignedToUserId,
			});
			if (!created) {
				throw new Error("Failed to create API key");
			}
			return { id: created.id };
		}

		await this.repository.updateNameById(input.id, finalName);
		return { id: input.id };
	}
}
