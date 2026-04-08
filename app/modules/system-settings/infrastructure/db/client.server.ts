import { dr, type Dr } from "~/db.server";

export type { Dr };

export function getSystemSettingsDb(): Dr {
	return dr;
}
