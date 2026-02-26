import { fieldsDefApi } from "~/backend.server/models/noneco_losses";
import { authLoaderApi } from "~/utils/auth";
import { BackendContext } from "~/backend.server/context";

export const loader = authLoaderApi(async (args) => {
	const ctx = new BackendContext(args);
	return Response.json(await fieldsDefApi(ctx));
});