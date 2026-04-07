import { dr, type Dr } from "~/db.server";

export type { Dr };

export function getOrganizationDb(): Dr {
	return dr;
}
