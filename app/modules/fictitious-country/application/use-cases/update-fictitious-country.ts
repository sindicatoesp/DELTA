import { COUNTRY_TYPE } from "~/drizzle/schema/countriesTable";
import {
	FictitiousCountryNotFoundError,
	FictitiousCountryValidationError,
} from "~/modules/fictitious-country/application/errors/fictitious-country-error";
import type { FictitiousCountryRepositoryPort } from "~/modules/fictitious-country/domain/repositories/fictitious-country-repository";

function isUniqueViolation(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return error.message.toLowerCase().includes("unique");
}

export class UpdateFictitiousCountryUseCase {
	constructor(private readonly repository: FictitiousCountryRepositoryPort) {}

	async execute(id: string, nameInput: string): Promise<void> {
		const name = nameInput.trim();
		if (!name) {
			throw new FictitiousCountryValidationError(["Name is required"]);
		}

		const existing = await this.repository.getById(id);
		if (!existing) {
			throw new FictitiousCountryNotFoundError();
		}

		const duplicate = await this.repository.getByName(name);
		if (duplicate && duplicate.id !== id) {
			throw new FictitiousCountryValidationError([
				"A country with this name already exists",
			]);
		}

		try {
			await this.repository.updateById(id, {
				name,
				type: COUNTRY_TYPE.FICTIONAL,
				iso3: null,
			});
		} catch (error) {
			if (isUniqueViolation(error)) {
				throw new FictitiousCountryValidationError([
					"A country with this name already exists",
				]);
			}
			throw error;
		}
	}
}
