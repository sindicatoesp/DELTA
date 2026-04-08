import type {
	UpdateUserProfileResult,
	UserProfileValidationErrors,
} from "~/modules/user-profile/domain/entities/user-profile";
import type { UserProfileRepositoryPort } from "~/modules/user-profile/domain/repositories/user-profile-repository";

interface UpdateUserProfileInput {
	userId: string;
	formData: FormData;
}

export class UpdateUserProfileUseCase {
	constructor(private readonly repository: UserProfileRepositoryPort) {}

	async execute(
		input: UpdateUserProfileInput,
	): Promise<UpdateUserProfileResult> {
		const firstName = String(input.formData.get("firstName") || "").trim();
		const lastName = String(input.formData.get("lastName") || "").trim();

		const errors: UserProfileValidationErrors = {};

		if (!firstName) {
			errors.firstName = "First name is required";
		}

		if (!lastName) {
			errors.lastName = "Last name is required";
		}

		if (errors.firstName || errors.lastName) {
			return {
				ok: false,
				data: { firstName, lastName },
				errors,
			};
		}

		await this.repository.updateById(input.userId, {
			firstName,
			lastName,
		});

		return { ok: true };
	}
}
