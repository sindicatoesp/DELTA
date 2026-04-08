import { eq } from "drizzle-orm";
import { userTable } from "~/drizzle/schema";
import { isValidUUID } from "~/utils/id";
import type { Dr } from "~/modules/user-profile/infrastructure/db/client.server";
import type { UserProfileRepositoryPort } from "~/modules/user-profile/domain/repositories/user-profile-repository";

export class DrizzleUserProfileRepository implements UserProfileRepositoryPort {
	constructor(private readonly db: Dr) {}

	async updateById(
		userId: string,
		data: {
			firstName: string;
			lastName: string;
		},
	): Promise<void> {
		if (!isValidUUID(userId)) {
			throw new Error(`Invalid UUID: ${userId}`);
		}

		await this.db
			.update(userTable)
			.set({
				firstName: data.firstName,
				lastName: data.lastName,
				updatedAt: new Date(),
			})
			.where(eq(userTable.id, userId))
			.execute();
	}
}
