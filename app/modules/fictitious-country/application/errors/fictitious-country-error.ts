export class FictitiousCountryValidationError extends Error {
	constructor(public errors: string[]) {
		super("Fictitious country validation failed");
		this.name = "FictitiousCountryValidationError";
	}
}

export class FictitiousCountryNotFoundError extends Error {
	constructor() {
		super("Fictitious country not found");
		this.name = "FictitiousCountryNotFoundError";
	}
}
