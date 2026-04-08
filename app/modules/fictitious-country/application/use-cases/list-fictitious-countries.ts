import type { FictitiousCountryRepositoryPort } from "~/modules/fictitious-country/domain/repositories/fictitious-country-repository";

export class ListFictitiousCountriesUseCase {
	constructor(private readonly repository: FictitiousCountryRepositoryPort) {}

	async execute() {
		return this.repository.getAllOrderByName();
	}
}
