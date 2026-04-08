import { CreateFictitiousCountryUseCase } from "~/modules/fictitious-country/application/use-cases/create-fictitious-country";
import { DeleteFictitiousCountryUseCase } from "~/modules/fictitious-country/application/use-cases/delete-fictitious-country";
import { GetFictitiousCountryUseCase } from "~/modules/fictitious-country/application/use-cases/get-fictitious-country";
import { ListFictitiousCountriesUseCase } from "~/modules/fictitious-country/application/use-cases/list-fictitious-countries";
import { UpdateFictitiousCountryUseCase } from "~/modules/fictitious-country/application/use-cases/update-fictitious-country";
import { getFictitiousCountryDb } from "~/modules/fictitious-country/infrastructure/db/client.server";
import { DrizzleFictitiousCountryRepository } from "~/modules/fictitious-country/infrastructure/repositories/drizzle-fictitious-country-repository.server";

function buildRepository() {
	return new DrizzleFictitiousCountryRepository(getFictitiousCountryDb());
}

export function makeListFictitiousCountriesUseCase(): ListFictitiousCountriesUseCase {
	return new ListFictitiousCountriesUseCase(buildRepository());
}

export function makeGetFictitiousCountryUseCase(): GetFictitiousCountryUseCase {
	return new GetFictitiousCountryUseCase(buildRepository());
}

export function makeCreateFictitiousCountryUseCase(): CreateFictitiousCountryUseCase {
	return new CreateFictitiousCountryUseCase(buildRepository());
}

export function makeUpdateFictitiousCountryUseCase(): UpdateFictitiousCountryUseCase {
	return new UpdateFictitiousCountryUseCase(buildRepository());
}

export function makeDeleteFictitiousCountryUseCase(): DeleteFictitiousCountryUseCase {
	return new DeleteFictitiousCountryUseCase(buildRepository());
}
