import type { AssetRepositoryPort } from "~/modules/assets/domain/repositories/asset-repository";

export interface SaveAssetInput {
	id: string | null;
	countryAccountsId: string;
	name: string;
	category: string;
	notes: string;
	sectorIds: string;
	nationalId?: string | null;
}

export type SaveAssetResult =
	| { ok: true; id: string }
	| { ok: false; error: string };

export class SaveAssetUseCase {
	constructor(private readonly repository: AssetRepositoryPort) {}

	async execute(input: SaveAssetInput): Promise<SaveAssetResult> {
		const name = input.name.trim();
		if (!name) {
			return { ok: false, error: "Name is required" };
		}

		const { id, countryAccountsId, ...data } = {
			...input,
			name,
		};

		if (!id || id === "new") {
			const created = await this.repository.create(data, countryAccountsId);
			return { ok: true, id: created.id };
		}

		await this.repository.update(id, countryAccountsId, data);
		return { ok: true, id };
	}
}
