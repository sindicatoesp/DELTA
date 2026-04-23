import { useLoaderData } from "react-router";

import { authLoader } from "~/utils/auth";
import { getUserRoleFromSession } from "~/utils/session";
import { makeGetSectorsPageDataUseCase } from "~/modules/sectors/sectors-module.server";
import SectorsPage from "~/modules/sectors/presentation/sectors-page";

export const loader = authLoader(async (loaderArgs) => {
    const { request } = loaderArgs;
    const userRole = await getUserRoleFromSession(request);
    const pageData = await makeGetSectorsPageDataUseCase().execute();

    return {
        ...pageData,
        userRole: userRole ?? null,
    };
});

export default function Screen() {
    const ld = useLoaderData<typeof loader>();
    return <SectorsPage {...ld} />;
}
