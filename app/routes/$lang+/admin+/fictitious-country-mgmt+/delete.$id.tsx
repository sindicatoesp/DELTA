import { eq } from "drizzle-orm";
import {
    ActionFunctionArgs,
    Form,
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
} from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";

import { dr } from "~/db.server";
import { countriesTable } from "~/drizzle/schema/countriesTable";
import { BackendContext } from "~/backend.server/context";
import { ViewContext } from "~/frontend/context";
import { authActionWithPerm, authLoaderWithPerm } from "~/utils/auth";
import { redirectWithMessage } from "~/utils/session";

type ActionData =
    | { errors: string[] };

export const loader = authLoaderWithPerm(
    "manage_country_accounts",
    async (loaderArgs) => {
        const id = loaderArgs.params.id!;
        const result = await dr
            .select({
                id: countriesTable.id,
                name: countriesTable.name,
                type: countriesTable.type,
            })
            .from(countriesTable)
            .where(eq(countriesTable.id, id))
            .limit(1);

        const country = result[0] ?? null;
        if (!country || country.type !== "Fictional") {
            throw new Response("Not Found", { status: 404 });
        }

        return { country };
    },
);

function isForeignKeyDeleteViolation(error: unknown): boolean {
    if (!error || typeof error !== "object") {
        return false;
    }

    const err = error as {
        code?: string;
        message?: string;
        cause?: { code?: string; message?: string };
    };

    if (err.code === "23503" || err.cause?.code === "23503") {
        return true;
    }

    const message = `${err.message ?? ""} ${err.cause?.message ?? ""}`.toLowerCase();
    return message.includes("foreign key") || message.includes("violates");
}

export const action = authActionWithPerm(
    "manage_country_accounts",
    async (actionArgs: ActionFunctionArgs) => {
        const id = actionArgs.params.id!;
        const backendCtx = new BackendContext(actionArgs);

        try {
            const existing = await dr
                .select({ id: countriesTable.id, type: countriesTable.type })
                .from(countriesTable)
                .where(eq(countriesTable.id, id))
                .limit(1);

            if (!existing[0] || existing[0].type !== "Fictional") {
                return { errors: ["Fictitious country not found"] } satisfies ActionData;
            }

            await dr.delete(countriesTable).where(eq(countriesTable.id, id));

            return redirectWithMessage(actionArgs, "/admin/fictitious-country-mgmt", {
                type: "success",
                text: backendCtx.t({
                    code: "admin.fictitious_country_deleted",
                    msg: "Fictitious country deleted successfully",
                }),
            });
        } catch (error) {
            if (isForeignKeyDeleteViolation(error)) {
                return {
                    errors: [
                        "This fictitious country cannot be deleted because it is used by other records.",
                    ],
                } satisfies ActionData;
            }

            const message =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred";
            return { errors: [message] } satisfies ActionData;
        }
    },
);

export default function FictitiousCountryDeletePage() {
    const ld = useLoaderData<typeof loader>();
    const ctx = new ViewContext();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const isSubmitting = navigation.state === "submitting";
    const error = actionData?.errors?.[0] ?? "";

    return (
        <Dialog
            header={ctx.t({ code: "common.record_deletion", msg: "Record Deletion" })}
            visible
            modal
            onHide={() => navigate(ctx.url("/admin/fictitious-country-mgmt"))}
            className="w-[32rem] max-w-full"
        >
            <Form method="post" className="flex flex-col" noValidate>
                <p className="mb-3">
                    {ctx.t({
                        code: "admin.fictitious_country_delete_confirm",
                        msg: `Delete fictitious country "${ld.country.name}"?`,
                    })}
                </p>

                {error ? <Message severity="error" text={error} className="mb-3" /> : null}

                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        outlined
                        icon="pi pi-times"
                        label={ctx.t({ code: "common.no", msg: "No" })}
                        onClick={() => navigate(ctx.url("/admin/fictitious-country-mgmt"))}
                    />
                    <Button
                        type="submit"
                        label={ctx.t({ code: "common.yes", msg: "Yes" })}
                        icon="pi pi-trash"
                        severity="danger"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    />
                </div>
            </Form>
        </Dialog>
    );
}
