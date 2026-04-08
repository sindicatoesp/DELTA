import { AccessManagementError } from "~/modules/access-management/application/errors/access-management-error";
import type { AccessManagementRepositoryPort } from "~/modules/access-management/domain/repositories/access-management-repository";

interface UpdateUserInput {
	id: string;
	countryAccountsId: string;
	role: string;
	organization: string | null;
}

export class UpdateUserUseCase {
	constructor(private readonly repository: AccessManagementRepositoryPort) {}

	async execute(input: UpdateUserInput): Promise<void> {
		const errors: Record<string, string> = {};
		const user = await this.repository.findUserById(input.id);
		if (!user) {
			throw new AccessManagementError(`User not found with id: ${input.id}`, {
				status: 404,
			});
		}

		const userCountryAccount =
			await this.repository.findUserCountryAccountByUserAndCountry(
				input.id,
				input.countryAccountsId,
			);

		if (!userCountryAccount) {
			throw new AccessManagementError(`User not found with id: ${input.id}`, {
				status: 400,
			});
		}

		if (userCountryAccount.isPrimaryAdmin) {
			errors.email = "Cannot update primary admin account data";
		}
		if (!input.role || input.role.trim() === "") {
			errors.role = "Role is required";
		}
		if (Object.keys(errors).length > 0) {
			throw new AccessManagementError("Validation error", {
				fieldErrors: errors,
				status: 400,
			});
		}

		await this.repository.runInTransaction(async (tx) => {
			await this.repository.updateUserCountryAccountById(
				userCountryAccount.id,
				{
					role: input.role,
					organizationId: input.organization,
				},
				tx,
			);
		});
	}
}
