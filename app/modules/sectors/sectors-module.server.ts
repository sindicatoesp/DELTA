import { GetSectorsPageDataUseCase } from "~/modules/sectors/application/use-cases/get-sectors-page-data";
import { getSectorsDb } from "~/modules/sectors/infrastructure/db/client.server";
import { DrizzleSectorRepository } from "~/modules/sectors/infrastructure/repositories/drizzle-sector-repository.server";

function buildSectorRepository() {
	return new DrizzleSectorRepository(getSectorsDb());
}

export function makeSectorRepository(): DrizzleSectorRepository {
	return buildSectorRepository();
}

export function makeGetSectorsPageDataUseCase(): GetSectorsPageDataUseCase {
	return new GetSectorsPageDataUseCase(buildSectorRepository());
}
