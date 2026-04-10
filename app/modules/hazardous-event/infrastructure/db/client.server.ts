import { dr, type Dr } from "~/db.server";

export type { Dr };

export function getHazardousEventDb(): Dr {
	return dr;
}
