import { AccessManagementError } from "~/modules/access-management/application/errors/access-management-error";
import type { AccessManagementRepositoryPort } from "~/modules/access-management/domain/repositories/access-management-repository";

interface DeleteUserInput {
	id: string;
	countryAccountsId: string;
}

export class DeleteUserUseCase {
	constructor(private readonly repository: AccessManagementRepositoryPort) {}

	async execute(input: DeleteUserInput): Promise<void> {
		const userToDelete =
			await this.repository.findUserCountryAccountByUserAndCountry(
				input.id,
				input.countryAccountsId,
			);

		if (!userToDelete) {
			throw new AccessManagementError(
				"User not found or you don't have permission to delete this user.",
				{ status: 404 },
			);
		}

		if (userToDelete.isPrimaryAdmin) {
			throw new AccessManagementError(
				"You cannot delete the primary admin user.",
				{ status: 403 },
			);
		}

		await this.repository.deleteUserCountryAccountByUserAndCountry(
			input.id,
			input.countryAccountsId,
		);
	}
}
