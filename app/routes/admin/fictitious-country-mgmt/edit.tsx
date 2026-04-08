import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";


import {
    FictitiousCountryNotFoundError,
    FictitiousCountryValidationError,
} from "~/modules/fictitious-country/application/errors/fictitious-country-error";
import {
    makeGetFictitiousCountryUseCase,
    makeUpdateFictitiousCountryUseCase,
} from "~/modules/fictitious-country/fictitious-country-module.server";
import { authActionWithPerm, authLoaderWithPerm } from "~/utils/auth";
import { redirectWithMessage } from "~/utils/session";


type ActionData =
    | { errors: string[] }
    | undefined;

export const loader = authLoaderWithPerm(
    "EditFictitiousCountry",
    async (loaderArgs) => {
        const id = loaderArgs.params.id!;
        try {
            const country = await makeGetFictitiousCountryUseCase().execute(id);
            return { country };
        } catch (error) {
            if (error instanceof FictitiousCountryNotFoundError) {
                throw new Response("Not Found", { status: 404 });
            }
            throw error;
        }
    },
);

export const action = authActionWithPerm(
    "EditFictitiousCountry",
    async (actionArgs) => {
        const { request } = actionArgs;

        const id = actionArgs.params.id!;
        const formData = await request.formData();
        const name = String(formData.get("name") ?? "");

        try {
            await makeUpdateFictitiousCountryUseCase().execute(id, name);

            return redirectWithMessage(actionArgs, "/admin/fictitious-country-mgmt", {
                type: "success",
                text: "Changes saved",
            });
        } catch (error) {
            if (error instanceof FictitiousCountryNotFoundError) {
                throw new Response("Not Found", { status: 404 });
            }
            if (error instanceof FictitiousCountryValidationError) {
                return { errors: error.errors } satisfies ActionData;
            }
            return { errors: ["An unexpected error occurred"] } satisfies ActionData;
        }
    },
);

export default function FictitiousCountryEditPage() {
    const ld = useLoaderData<typeof loader>();

    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [name, setName] = useState(ld.country.name);
    const nameError = actionData?.errors?.[0] ?? "";

    return (
        <Dialog
            header={"Edit fictitious country"}
            visible
            modal
            onHide={() => navigate("/admin/fictitious-country-mgmt")}
            className="w-[32rem] max-w-full"
        >
            <Form method="post" className="flex flex-col" noValidate>
                <p className="mb-3 text-red-700">* Required information</p>
                <div className="mb-3 flex flex-col gap-2">
                    <label htmlFor="edit-fictitious-country-name">
                        <span className="inline-flex gap-1">
                            <span>{"Name"}</span>
                            <span className="text-red-700">*</span>
                        </span>
                    </label>
                    <InputText
                        id="edit-fictitious-country-name"
                        name="name"
                        value={name}
                        invalid={!!nameError}
                        aria-invalid={nameError ? true : false}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError ? <small className="text-red-700">{nameError}</small> : null}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        outlined
                        icon="pi pi-times"
                        label={"Cancel"}
                        onClick={() => navigate("/admin/fictitious-country-mgmt")}
                    />
                    <Button
                        type="submit"
                        label={"Save"}
                        icon="pi pi-check"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    />
                </div>
            </Form>
        </Dialog>
    );
}
