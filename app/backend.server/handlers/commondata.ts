import {
	authLoaderGetOptionalUserForFrontend,
	UserForFrontend,
} from "~/utils/auth";

export interface CommonData {
	common: CommonDataUnwrapped;
}

export interface CommonDataUnwrapped {
	lang: string;
	user: UserForFrontend | null;
}

export type CommonDataLoaderArgs = {
	request: Request;
	params: { lang?: string };
};

export async function getCommonData(
	args: CommonDataLoaderArgs,
): Promise<CommonDataUnwrapped> {
	let lang = "en";
	let user = await authLoaderGetOptionalUserForFrontend(args);
	return {
		lang,
		user,
	};
}
