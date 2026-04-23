import type { SectorsPageData } from "~/modules/sectors/domain/entities/sector";

export interface SectorRepositoryPort {
	getSectorsPageData(): Promise<SectorsPageData>;
}
