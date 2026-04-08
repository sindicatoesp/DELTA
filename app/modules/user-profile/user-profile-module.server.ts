import { GetUserProfileForEditUseCase } from "~/modules/user-profile/application/use-cases/get-user-profile-for-edit";
import { UpdateUserProfileUseCase } from "~/modules/user-profile/application/use-cases/update-user-profile";
import { getUserProfileDb } from "~/modules/user-profile/infrastructure/db/client.server";
import { DrizzleUserProfileRepository } from "~/modules/user-profile/infrastructure/repositories/drizzle-user-profile-repository.server";

function buildUserProfileRepository() {
	return new DrizzleUserProfileRepository(getUserProfileDb());
}

export function makeUserProfileRepository(): DrizzleUserProfileRepository {
	return buildUserProfileRepository();
}

export function makeGetUserProfileForEditUseCase(): GetUserProfileForEditUseCase {
	return new GetUserProfileForEditUseCase();
}

export function makeUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
	return new UpdateUserProfileUseCase(buildUserProfileRepository());
}
