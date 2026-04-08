import {
	FictitiousCountryNotFoundError,
	FictitiousCountryValidationError,
} from "~/modules/fictitious-country/application/errors/fictitious-country-error";
import type { FictitiousCountryRepositoryPort } from "~/modules/fictitious-country/domain/repositories/fictitious-country-repository";

function isForeignKeyDeleteViolation(error: unknown): boolean {
	if (!error || typeof error !== "object") return false;
	const err = error as {
		code?: string;
		message?: string;
		cause?: { code?: string; message?: string };
	};
	if (err.code === "23503" || err.cause?.code === "23503") return true;
	const message =
		`${err.message ?? ""} ${err.cause?.message ?? ""}`.toLowerCase();
	return message.includes("foreign key") || message.includes("violates");
}

export class DeleteFictitiousCountryUseCase {
	constructor(private readonly repository: FictitiousCountryRepositoryPort) {}

	async execute(id: string): Promise<void> {
		const existing = await this.repository.getById(id);
		if (!existing) {
			throw new FictitiousCountryNotFoundError();
		}

		try {
			await this.repository.deleteById(id);
		} catch (error) {
			if (isForeignKeyDeleteViolation(error)) {
				throw new FictitiousCountryValidationError([
					"This fictitious country cannot be deleted because it is used by other records.",
				]);
			}
			throw error;
		}
	}
}
