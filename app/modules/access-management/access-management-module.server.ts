import { DeleteUserUseCase } from "~/modules/access-management/application/use-cases/delete-user";
import { InviteUserUseCase } from "~/modules/access-management/application/use-cases/invite-user";
import { ListAccessManagementUseCase } from "~/modules/access-management/application/use-cases/list-access-management";
import { ResendInvitationUseCase } from "~/modules/access-management/application/use-cases/resend-invitation";
import { UpdateUserUseCase } from "~/modules/access-management/application/use-cases/update-user";
import { getAccessManagementDb } from "~/modules/access-management/infrastructure/db/client.server";
import { DrizzleAccessManagementRepository } from "~/modules/access-management/infrastructure/repositories/drizzle-access-management-repository.server";
import { makeOrganizationRepository } from "~/modules/organizations/organization-module.server";

function buildAccessManagementRepository() {
	return new DrizzleAccessManagementRepository(getAccessManagementDb());
}

export function makeAccessManagementRepository(): DrizzleAccessManagementRepository {
	return buildAccessManagementRepository();
}

export function makeInviteUserUseCase(): InviteUserUseCase {
	return new InviteUserUseCase(buildAccessManagementRepository());
}

export function makeListAccessManagementUseCase(): ListAccessManagementUseCase {
	return new ListAccessManagementUseCase(
		buildAccessManagementRepository(),
		makeOrganizationRepository(),
	);
}

export function makeUpdateUserUseCase(): UpdateUserUseCase {
	return new UpdateUserUseCase(buildAccessManagementRepository());
}

export function makeDeleteUserUseCase(): DeleteUserUseCase {
	return new DeleteUserUseCase(buildAccessManagementRepository());
}

export function makeResendInvitationUseCase(): ResendInvitationUseCase {
	return new ResendInvitationUseCase(buildAccessManagementRepository());
}
