import { addHours } from "date-fns";
import { sendInviteForNewUser } from "~/utils/emailUtil";
import { AccessManagementError } from "~/modules/access-management/application/errors/access-management-error";
import type { AccessManagementRepositoryPort } from "~/modules/access-management/domain/repositories/access-management-repository";

interface CountrySettings {
	websiteName: string;
	countryName: string;
}

interface ResendInvitationInput {
	id: string;
	countryAccountsId: string;
	countrySettings: CountrySettings;
}

export class ResendInvitationUseCase {
	constructor(private readonly repository: AccessManagementRepositoryPort) {}

	async execute(input: ResendInvitationInput): Promise<void> {
		const countryAccountType = await this.repository.findCountryAccountType(
			input.countryAccountsId,
		);

		const userCountryAccount =
			await this.repository.findUserCountryAccountByUserAndCountry(
				input.id,
				input.countryAccountsId,
			);
		if (!userCountryAccount) {
			throw new AccessManagementError(
				`User with id: ${input.id} not found in this instance.`,
				{ status: 404 },
			);
		}

		const user = await this.repository.findUserById(input.id);
		if (!user) {
			throw new AccessManagementError(`User not found with id: ${input.id}`, {
				status: 404,
			});
		}

		if (user.emailVerified) {
			throw new AccessManagementError("Account activated", {
				errors: ["Account activated"],
				status: 400,
			});
		}

		const existingInviteCode = user.inviteCode;
		if (!existingInviteCode) {
			throw new AccessManagementError(
				"Missing invitation code for unverified user.",
				{ status: 400 },
			);
		}

		const expirationTime = addHours(new Date(), 14 * 24);
		await this.repository.updateUserById(user.id, {
			inviteSentAt: new Date(),
			inviteExpiresAt: expirationTime,
		});

		await sendInviteForNewUser(
			user,
			input.countrySettings.websiteName,
			userCountryAccount.role,
			input.countrySettings.countryName,
			countryAccountType,
			existingInviteCode,
		);
	}
}
