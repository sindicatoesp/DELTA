export class OrganizationDomainError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "OrganizationDomainError";
	}
}
