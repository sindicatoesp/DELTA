import type { UserProfileForEdit } from "~/modules/user-profile/domain/entities/user-profile";

interface GetUserProfileForEditInput {
	firstName?: string | null;
	lastName?: string | null;
}

export class GetUserProfileForEditUseCase {
	execute(input: GetUserProfileForEditInput): UserProfileForEdit {
		return {
			firstName: input.firstName || "",
			lastName: input.lastName || "",
		};
	}
}
