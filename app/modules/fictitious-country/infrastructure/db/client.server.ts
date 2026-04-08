import { dr, type Tx } from "~/db.server";

export type FictitiousCountryDb = typeof dr;
export type FictitiousCountryTx = Tx;

export function getFictitiousCountryDb(): FictitiousCountryDb {
	return dr;
}
