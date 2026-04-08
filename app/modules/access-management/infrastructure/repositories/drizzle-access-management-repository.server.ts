import type { Tx } from "~/db.server";
import { eq } from "drizzle-orm";
import { CountryAccountsRepository } from "~/db/queries/countryAccountsRepository";
import {
	deleteUserCountryAccountsByUserIdAndCountryAccountsId,
	doesUserCountryAccountExistByEmailAndCountryAccountsId,
	getUserCountryAccountsByUserIdAndCountryAccountsId,
	updateUserCountryAccountsById,
	UserCountryAccountRepository,
} from "~/db/queries/userCountryAccountsRepository";
import { UserRepository } from "~/db/queries/UserRepository";
import { userCountryAccountsTable } from "~/drizzle/schema/userCountryAccountsTable";
import type { AccessManagementRepositoryPort } from "~/modules/access-management/domain/repositories/access-management-repository";
import type { AccessManagementDb } from "~/modules/access-management/infrastructure/db/client.server";

export class DrizzleAccessManagementRepository implements AccessManagementRepositoryPort {
	constructor(private readonly db: AccessManagementDb) {}

	async listUsersByCountryAccountsId(params: {
		countryAccountsId: string;
		offset: number;
		limit: number;
	}) {
		const items = await this.db.query.userCountryAccountsTable.findMany({
			where: eq(
				userCountryAccountsTable.countryAccountsId,
				params.countryAccountsId,
			),
			limit: params.limit,
			offset: params.offset,
			with: {
				user: {
					columns: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						emailVerified: true,
					},
				},
				organization: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});

		const total = await this.db.$count(
			userCountryAccountsTable,
			eq(userCountryAccountsTable.countryAccountsId, params.countryAccountsId),
		);

		return { items, total };
	}

	runInTransaction<T>(callback: (tx: Tx) => Promise<T>): Promise<T> {
		return this.db.transaction(async (tx) => callback(tx));
	}

	async findCountryAccountType(countryAccountsId: string): Promise<string> {
		const countryAccount =
			await CountryAccountsRepository.getById(countryAccountsId);
		return countryAccount?.type || "[null]";
	}

	findUserByEmail(email: string) {
		return UserRepository.getByEmail(email);
	}

	findUserById(userId: string) {
		return UserRepository.getById(userId);
	}

	createUser(email: string, tx: Tx) {
		return UserRepository.create({ email }, tx);
	}

	async updateUserById(
		userId: string,
		data: Partial<{
			inviteSentAt: Date;
			inviteCode: string;
			inviteExpiresAt: Date;
		}>,
		tx?: Tx,
	): Promise<void> {
		await UserRepository.updateById(userId, data, tx);
	}

	async createUserCountryAccount(
		data: {
			userId: string;
			countryAccountsId: string;
			role: string;
			isPrimaryAdmin: boolean;
			organizationId: string | null;
		},
		tx: Tx,
	): Promise<void> {
		await UserCountryAccountRepository.create(data, tx);
	}

	findUserCountryAccountByUserAndCountry(
		userId: string,
		countryAccountsId: string,
	) {
		return getUserCountryAccountsByUserIdAndCountryAccountsId(
			userId,
			countryAccountsId,
		);
	}

	findUserCountryAccountByEmailAndCountry(
		email: string,
		countryAccountsId: string,
	) {
		return doesUserCountryAccountExistByEmailAndCountryAccountsId(
			email,
			countryAccountsId,
		);
	}

	async updateUserCountryAccountById(
		id: string,
		data: { role: string; organizationId: string | null },
		tx: Tx,
	): Promise<void> {
		await updateUserCountryAccountsById(id, data, tx);
	}

	async deleteUserCountryAccountByUserAndCountry(
		userId: string,
		countryAccountsId: string,
	): Promise<void> {
		await deleteUserCountryAccountsByUserIdAndCountryAccountsId(
			userId,
			countryAccountsId,
		);
	}
}
