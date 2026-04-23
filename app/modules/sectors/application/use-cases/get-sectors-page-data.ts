import type { SectorsPageData } from "~/modules/sectors/domain/entities/sector";
import type { SectorRepositoryPort } from "~/modules/sectors/domain/repositories/sector-repository";

export class GetSectorsPageDataUseCase {
	constructor(private readonly repository: SectorRepositoryPort) {}

	async execute(): Promise<SectorsPageData> {
		return this.repository.getSectorsPageData();
	}
}
