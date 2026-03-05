import {
	InsertUserCountryAccounts,
	SelectUserCountryAccounts,
	userCountryAccounts,
} from "~/drizzle/schema/userCountryAccountsTable";
import { userTable } from "~/drizzle/schema";
import { and, eq, sql } from "drizzle-orm";
import { dr, Tx } from "~/db.server";

export async function getUserCountryAccountsByUserId(
	userId: string,
): Promise<SelectUserCountryAccounts[]> {
	return await dr
		.select()
		.from(userCountryAccounts)
		.where(eq(userCountryAccounts.userId, userId))
		.execute();
}

export async function createUserCountryAccounts(
	data: Omit<InsertUserCountryAccounts, "id" | "addedAt">,
	tx?: Tx,
): Promise<SelectUserCountryAccounts> {
	const db = tx || dr;
	const result = await db
		.insert(userCountryAccounts)
		.values({ ...data, organizationId: data.organizationId ?? null })
		.returning()
		.execute();
	return result[0];
}

export async function getUserCountryAccountsWithUserByCountryAccountsId(
	pageNumber: number,
	pageSize: number,
	countryAccountsId: string,
) {
	const offset = pageNumber * pageSize;
	const items = await dr.query.userCountryAccounts.findMany({
		where: eq(userCountryAccounts.countryAccountsId, countryAccountsId),
		limit: pageSize,
		offset: offset,
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
	const total = await dr.$count(
		userCountryAccounts,
		eq(userCountryAccounts.countryAccountsId, countryAccountsId),
	);

	return {
		items,
		pagination: {
			total,
			pageNumber,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
			extraParams: {},
		},
	};
}

export async function doesUserCountryAccountExistByEmailAndCountryAccountsId(
	email: string,
	countryAccountsId: string,
	tx?: Tx,
): Promise<boolean> {
	const db = tx || dr;
	const result = await db
		.select({ count: sql`count(*)`.mapWith(Number) })
		.from(userTable)
		.innerJoin(
			userCountryAccounts,
			eq(userTable.id, userCountryAccounts.userId),
		)
		.where(
			and(
				eq(userTable.email, email),
				eq(userCountryAccounts.countryAccountsId, countryAccountsId),
			),
		)
		.execute();

	return result[0].count > 0;
}

export async function doesUserCountryAccountExistByUserIdAndCountryAccountsId(
	userId: string,
	countryAccountsId: string,
	tx?: Tx,
): Promise<boolean> {
	const db = tx || dr;
	const result = await db
		.select({ count: sql`count(*)`.mapWith(Number) })
		.from(userTable)
		.innerJoin(
			userCountryAccounts,
			eq(userTable.id, userCountryAccounts.userId),
		)
		.where(
			and(
				eq(userTable.id, userId),
				eq(userCountryAccounts.countryAccountsId, countryAccountsId),
			),
		)
		.execute();

	return result[0].count > 0;
}

export async function getUserCountryAccountsByUserIdAndCountryAccountsId(
	userId: string,
	countryAccountsId: string,
	tx?: Tx,
) {
	const db = tx || dr;
	const result = await db
		.select()
		.from(userCountryAccounts)
		.where(
			and(
				eq(userCountryAccounts.userId, userId),
				eq(userCountryAccounts.countryAccountsId, countryAccountsId),
			),
		)
		.execute();
	return result.length > 0 ? result[0] : null;
}

export async function deleteUserCountryAccountsByUserIdAndCountryAccountsId(
	userId: string,
	countryAccountsId: string,
	tx?: Tx,
) {
	const db = tx || dr;
	const result = await db
		.delete(userCountryAccounts)
		.where(
			and(
				eq(userCountryAccounts.userId, userId),
				eq(userCountryAccounts.countryAccountsId, countryAccountsId),
			),
		)
		.execute();
	return result.rowCount;
}

export async function getUserCountryAccountsWithValidatorRole(
	countryAccountsId: string,
) {
	const users = await dr
		.select({
			id: userTable.id,
			email: userTable.email,
			firstName: userTable.firstName,
			lastName: userTable.lastName,
			role: userCountryAccounts.role,
			isPrimaryAdmin: userCountryAccounts.isPrimaryAdmin,
			// organization: userTable.organization,
		})
		.from(userCountryAccounts)
		.where(
			and(
				eq(userCountryAccounts.countryAccountsId, countryAccountsId),
				eq(userCountryAccounts.role, "data-validator"),
				eq(userTable.emailVerified, true),
			),
		)
		.innerJoin(userTable, eq(userTable.id, userCountryAccounts.userId))
		.orderBy(userTable.firstName, userTable.lastName);

	return users;
}

export async function updateUserCountryAccountsById(
	id: string,
	data: Partial<Omit<InsertUserCountryAccounts, "id">>,
	tx?: Tx,
): Promise<InsertUserCountryAccounts> {
	const db = tx || dr;
	const [updatedUserCountryAccounts] = await db
		.update(userCountryAccounts)
		.set({
			...data,
			organizationId: data.organizationId ?? null,
		})
		.where(eq(userCountryAccounts.id, id))
		.returning();
	if (!updatedUserCountryAccounts) {
		throw new Error(`UserCountryAccount with id ${id} not found`);
	}

	return updatedUserCountryAccounts;
}
