export class AccessManagementError extends Error {
	status: number;
	fieldErrors?: Record<string, string>;
	errors?: string[];

	constructor(
		message: string,
		options?: {
			status?: number;
			fieldErrors?: Record<string, string>;
			errors?: string[];
		},
	) {
		super(message);
		this.name = "AccessManagementError";
		this.status = options?.status ?? 400;
		this.fieldErrors = options?.fieldErrors;
		this.errors = options?.errors;
	}
}
