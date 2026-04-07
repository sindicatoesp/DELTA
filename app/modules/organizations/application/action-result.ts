export type OrganizationActionIntent = "create" | "update" | "delete";

export type OrganizationActionResult =
	| {
			ok: true;
			intent: OrganizationActionIntent;
	  }
	| {
			ok: false;
			error: string;
	  };
