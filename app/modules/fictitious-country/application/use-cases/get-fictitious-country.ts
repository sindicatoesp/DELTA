import { FictitiousCountryNotFoundError } from "~/modules/fictitious-country/application/errors/fictitious-country-error";
import type { FictitiousCountryRepositoryPort } from "~/modules/fictitious-country/domain/repositories/fictitious-country-repository";

export class GetFictitiousCountryUseCase {
	constructor(private readonly repository: FictitiousCountryRepositoryPort) {}

	async execute(id: string) {
		const country = await this.repository.getById(id);
		if (!country) {
			throw new FictitiousCountryNotFoundError();
		}
		return country;
	}
}
