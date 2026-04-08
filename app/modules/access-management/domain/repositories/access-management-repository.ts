import type { Tx } from "~/db.server";
import type { SelectUser } from "~/drizzle/schema";

type UserRecord = SelectUser;

type UserCountryAccountRecord = {
	id: string;
	userId: string;
	countryAccountsId: string;
	role: string;
	isPrimaryAdmin: boolean;
	organizationId: string | null;
	addedAt: Date;
};

export interface AccessManagementRepositoryPort {
	listUsersByCountryAccountsId(params: {
		countryAccountsId: string;
		offset: number;
		limit: number;
	}): Promise<{
		items: Array<{
			user: {
				id: string;
				firstName: string | null;
				lastName: string | null;
				email: string;
				emailVerified: boolean;
			};
			organization: { id: string; name: string } | null;
			role: string;
			isPrimaryAdmin: boolean;
			addedAt: Date;
		}>;
		total: number;
	}>;
	runInTransaction<T>(callback: (tx: Tx) => Promise<T>): Promise<T>;
	findCountryAccountType(countryAccountsId: string): Promise<string>;
	findUserByEmail(email: string): Promise<UserRecord | null>;
	findUserById(userId: string): Promise<UserRecord | null>;
	createUser(email: string, tx: Tx): Promise<UserRecord>;
	updateUserById(
		userId: string,
		data: Partial<{
			inviteSentAt: Date;
			inviteCode: string;
			inviteExpiresAt: Date;
		}>,
		tx?: Tx,
	): Promise<void>;
	createUserCountryAccount(
		data: {
			userId: string;
			countryAccountsId: string;
			role: string;
			isPrimaryAdmin: boolean;
			organizationId: string | null;
		},
		tx: Tx,
	): Promise<void>;
	findUserCountryAccountByUserAndCountry(
		userId: string,
		countryAccountsId: string,
	): Promise<UserCountryAccountRecord | null>;
	findUserCountryAccountByEmailAndCountry(
		email: string,
		countryAccountsId: string,
	): Promise<boolean>;
	updateUserCountryAccountById(
		id: string,
		data: { role: string; organizationId: string | null },
		tx: Tx,
	): Promise<void>;
	deleteUserCountryAccountByUserAndCountry(
		userId: string,
		countryAccountsId: string,
	): Promise<void>;
}
