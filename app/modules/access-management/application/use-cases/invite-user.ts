import { addHours } from "date-fns";
import { randomBytes } from "node:crypto";
import {
	sendInviteForExistingUser,
	sendInviteForNewUser,
} from "~/utils/emailUtil";
import { isValidEmail } from "~/utils/email";
import { AccessManagementError } from "~/modules/access-management/application/errors/access-management-error";
import type { AccessManagementRepositoryPort } from "~/modules/access-management/domain/repositories/access-management-repository";

interface CountrySettings {
	websiteName: string;
	countryName: string;
}

interface InviteUserInput {
	email: string;
	organization: string | null;
	role: string;
	countryAccountsId: string;
	countrySettings: CountrySettings;
	loggedInUserEmail?: string;
}

export class InviteUserUseCase {
	constructor(private readonly repository: AccessManagementRepositoryPort) {}

	async execute(input: InviteUserInput): Promise<void> {
		const errors: Record<string, string> = {};
		const email = input.email?.trim() ?? "";
		const role = input.role?.trim() ?? "";

		if (!email) {
			errors.email = "Email is required";
		} else if (!isValidEmail(email)) {
			errors.email = "Invalid email format.";
		} else if (
			input.loggedInUserEmail &&
			email.toLowerCase() === input.loggedInUserEmail.toLowerCase()
		) {
			errors.email = "You cannot use your own email.";
		}

		if (!role) {
			errors.role = "Role is required";
		}

		const emailAlreadyAssignedToCountryAccount =
			await this.repository.findUserCountryAccountByEmailAndCountry(
				email,
				input.countryAccountsId,
			);
		let user = await this.repository.findUserByEmail(email);
		const now = new Date();

		if (emailAlreadyAssignedToCountryAccount && user) {
			const hasActiveInvite =
				!!user.inviteExpiresAt && user.inviteExpiresAt > now;
			const isUnverifiedAndExpired =
				!user.emailVerified &&
				(!user.inviteExpiresAt || user.inviteExpiresAt <= now);

			if (user.emailVerified || hasActiveInvite) {
				errors.email = "Email already invited.";
			}

			if (isUnverifiedAndExpired) {
				delete errors.email;
			}
		}

		if (Object.keys(errors).length > 0) {
			throw new AccessManagementError("Validation error", {
				fieldErrors: errors,
				status: 400,
			});
		}

		const countryAccountType = await this.repository.findCountryAccountType(
			input.countryAccountsId,
		);
		const expirationTime = addHours(new Date(), 14 * 24);

		await this.repository.runInTransaction(async (tx) => {
			if (!user) {
				const inviteCode = randomBytes(32).toString("hex");
				user = await this.repository.createUser(email, tx);

				await this.repository.updateUserById(
					user.id,
					{
						inviteSentAt: new Date(),
						inviteCode,
						inviteExpiresAt: expirationTime,
					},
					tx,
				);

				await this.repository.createUserCountryAccount(
					{
						userId: user.id,
						countryAccountsId: input.countryAccountsId,
						role,
						isPrimaryAdmin: false,
						organizationId: input.organization,
					},
					tx,
				);

				await sendInviteForNewUser(
					user,
					input.countrySettings.websiteName,
					role,
					input.countrySettings.countryName,
					countryAccountType,
					inviteCode,
				);
				return;
			}

			if (!emailAlreadyAssignedToCountryAccount) {
				await this.repository.createUserCountryAccount(
					{
						userId: user.id,
						countryAccountsId: input.countryAccountsId,
						role,
						isPrimaryAdmin: false,
						organizationId: input.organization,
					},
					tx,
				);

				if (!user.emailVerified) {
					const existingInviteCode = user.inviteCode;
					if (!existingInviteCode) {
						throw new AccessManagementError(
							"Missing invitation code for unverified user.",
							{ status: 400 },
						);
					}

					await this.repository.updateUserById(
						user.id,
						{
							inviteSentAt: new Date(),
							inviteExpiresAt: expirationTime,
						},
						tx,
					);

					await sendInviteForNewUser(
						user,
						input.countrySettings.websiteName,
						role,
						input.countrySettings.countryName,
						countryAccountType,
						existingInviteCode,
					);
				} else {
					await sendInviteForExistingUser(
						user,
						input.countrySettings.websiteName,
						role,
						input.countrySettings.countryName,
						countryAccountType,
					);
				}
				return;
			}

			const existingInviteCode = user.inviteCode;
			if (!existingInviteCode) {
				throw new AccessManagementError(
					"Missing invitation code for unverified user.",
					{ status: 400 },
				);
			}

			await this.repository.updateUserById(
				user.id,
				{
					inviteSentAt: new Date(),
					inviteExpiresAt: expirationTime,
				},
				tx,
			);

			await sendInviteForNewUser(
				user,
				input.countrySettings.websiteName,
				role,
				input.countrySettings.countryName,
				countryAccountType,
				existingInviteCode,
			);
		});
	}
}
