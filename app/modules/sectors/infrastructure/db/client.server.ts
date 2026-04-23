import { dr, type Dr } from "~/db.server";

export type { Dr };

export function getSectorsDb(): Dr {
	return dr;
}
