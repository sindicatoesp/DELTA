import { dr, type Tx } from "~/db.server";

export type AccessManagementDb = typeof dr;
export type AccessManagementTx = Tx;

export function getAccessManagementDb(): AccessManagementDb {
	return dr;
}
