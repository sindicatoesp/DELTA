import { COUNTRY_TYPE } from "~/drizzle/schema/countriesTable";
import { FictitiousCountryValidationError } from "~/modules/fictitious-country/application/errors/fictitious-country-error";
import type { FictitiousCountryRepositoryPort } from "~/modules/fictitious-country/domain/repositories/fictitious-country-repository";

const FICTIONAL_COUNTRY_FLAG_URL = "/assets/country-instance-logo.png";

function isUniqueViolation(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return error.message.toLowerCase().includes("unique");
}

export class CreateFictitiousCountryUseCase {
	constructor(private readonly repository: FictitiousCountryRepositoryPort) {}

	async execute(nameInput: string): Promise<void> {
		const name = nameInput.trim();
		if (!name) {
			throw new FictitiousCountryValidationError(["Name is required"]);
		}

		const duplicate = await this.repository.getByName(name);
		if (duplicate) {
			throw new FictitiousCountryValidationError([
				"A country with this name already exists",
			]);
		}

		try {
			await this.repository.create({
				name,
				type: COUNTRY_TYPE.FICTIONAL,
				iso3: null,
				flagUrl: FICTIONAL_COUNTRY_FLAG_URL,
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
