export class HazardousEventDomainError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "HazardousEventDomainError";
	}
}
