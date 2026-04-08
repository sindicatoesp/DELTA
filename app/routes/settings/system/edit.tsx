import type { LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigate } from "react-router";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { PERMISSIONS } from "~/frontend/user/roles";
import { getCurrencyList } from "~/utils/currency";
import { authActionWithPerm, requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession } from "~/utils/session";
import {
    makeGetSystemSettingsPageDataUseCase,
    makeUpdateSystemSettingsUseCase,
} from "~/modules/system-settings/system-settings-module.server";
import { SystemSettingsValidationError } from "~/modules/system-settings/application/use-cases/update-system-settings";
import { redirectWithMessage } from "~/utils/session";

type ActionError = {
    errors: Record<string, string>;
};

type ActionData = ActionError;

export async function loader({ request }: LoaderFunctionArgs) {
    await requirePermission(request, PERMISSIONS.COUNTRY_SETTINGS_MANAGE);
    const countryAccountsId = await getCountryAccountsIdFromSession(request);
    const systemSettingsData = await makeGetSystemSettingsPageDataUseCase().execute({
        countryAccountsId,
    });

    return {
        availableLanguages: systemSettingsData.availableLanguages,
        systemLanguage: systemSettingsData.systemLanguage,
        instanceSystemSettings: systemSettingsData.instanceSystemSettings,
    };
}

export const action = authActionWithPerm(
    PERMISSIONS.COUNTRY_SETTINGS_MANAGE,
    async (args) => {
        const request = args.request;
        const formData = await request.formData();
        const id = formData.get("id") as string;
        const privacyUrl = formData.get("privacyUrl") as string;
        const termsUrl = formData.get("termsUrl") as string;
        const websiteLogoUrl = formData.get("websiteLogoUrl") as string;
        const websiteName = formData.get("websiteName") as string;
        const approvedRecordsArePublic =
            formData.get("approvedRecordsArePublic") === "true";
        const totpIssuer = formData.get("totpIssuer") as string;
        const currency = formData.get("currency") as string;
        const language = formData.get("language") as string;

        try {
            await makeUpdateSystemSettingsUseCase().execute({
                id,
                privacyUrl,
                termsUrl,
                websiteLogoUrl,
                websiteName,
                isApprovedRecordsPublic: approvedRecordsArePublic,
                totpIssuer,
                currency,
                language,
            });

            return redirectWithMessage(args, "/settings/system", {
                type: "success",
                text: "System settings updated successfully. Changes will take effect after you login again.",
            });
        } catch (error) {
            if (error instanceof SystemSettingsValidationError) {
                return { errors: error.errors };
            }

            console.log(error);
            return { errors: { form: "An unexpected error occured" } };
        }
    },
);

export default function SettingsSystemEditPage() {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<ActionData>();
    const navigate = useNavigate();

    const [privacyUrl, setPrivacyUrl] = useState(
        loaderData.instanceSystemSettings?.footerUrlPrivacyPolicy || "",
    );
    const [termsUrl, setTermsUrl] = useState(
        loaderData.instanceSystemSettings?.footerUrlTermsConditions || "",
    );
    const [websiteLogoUrl, setWebsiteLogoUrl] = useState(
        loaderData.instanceSystemSettings?.websiteLogo || "",
    );
    const [websiteName, setWebsiteName] = useState(
        loaderData.instanceSystemSettings?.websiteName || "",
    );
    const [approvedRecordsArePublic, setApprovedRecordsArePublic] = useState(
        loaderData.instanceSystemSettings?.approvedRecordsArePublic ?? false,
    );
    const [currency, setCurrency] = useState(
        loaderData.instanceSystemSettings?.currencyCode || "",
    );
    const [language, setLanguage] = useState(loaderData.systemLanguage);
    const [totpIssuer, setTotpIssuer] = useState(
        loaderData.instanceSystemSettings?.totpIssuer || "",
    );

    const errors = actionData?.errors ?? {};

    return (
        <Dialog
            header={"Edit Settings"}
            visible
            onHide={() => navigate("/settings/system")}
            modal
            className="w-[32rem] max-w-full"
        >
            <Form method="post" id="editSystemSettingsForm">
                <input
                    type="hidden"
                    name="id"
                    value={loaderData.instanceSystemSettings?.id || ""}
                />

                <div className="space-y-4">
                    <div className="text-sm text-red-600">{`* ${"Required information"}`}</div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Language"}<span className="text-red-500 ml-1">*</span></label>
                        <Dropdown
                            name="language"
                            value={language}
                            options={loaderData.availableLanguages}
                            onChange={(e) => setLanguage(e.value)}
                            className="w-full"
                            invalid={!!errors.language}
                        />
                        {errors.language && <small className="text-red-500">{errors.language}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Privacy Policy URL"}</label>
                        <InputText
                            name="privacyUrl"
                            value={privacyUrl}
                            onChange={(e) => setPrivacyUrl(e.target.value)}
                            placeholder="https://example.com/privacy"
                            invalid={!!errors.privacyUrl}
                        />
                        {errors.privacyUrl && <small className="text-red-500">{errors.privacyUrl}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Terms and Conditions URL"}</label>
                        <InputText
                            name="termsUrl"
                            value={termsUrl}
                            onChange={(e) => setTermsUrl(e.target.value)}
                            placeholder="https://example.com/terms"
                            invalid={!!errors.termsUrl}
                        />
                        {errors.termsUrl && <small className="text-red-500">{errors.termsUrl}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Website Logo URL"}<span className="text-red-500 ml-1">*</span></label>
                        <InputText
                            name="websiteLogoUrl"
                            value={websiteLogoUrl}
                            onChange={(e) => setWebsiteLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.svg"
                            invalid={!!errors.websiteLogoUrl}
                        />
                        {errors.websiteLogoUrl && <small className="text-red-500">{errors.websiteLogoUrl}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Website Name"}<span className="text-red-500 ml-1">*</span></label>
                        <InputText
                            name="websiteName"
                            value={websiteName}
                            onChange={(e) => setWebsiteName(e.target.value)}
                            placeholder="Enter website name"
                            invalid={!!errors.websiteName}
                        />
                        {errors.websiteName && <small className="text-red-500">{errors.websiteName}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Approved records visibility"}<span className="text-red-500 ml-1">*</span></label>
                        <Dropdown
                            name="approvedRecordsArePublic"
                            value={approvedRecordsArePublic ? "true" : "false"}
                            options={[
                                { label: "Public", value: "true" },
                                { label: "Private", value: "false" },
                            ]}
                            onChange={(e) => setApprovedRecordsArePublic(e.value === "true")}
                            invalid={!!errors.approvedRecordsArePublic}
                        />
                        {errors.approvedRecordsArePublic && <small className="text-red-500">{errors.approvedRecordsArePublic}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Currency"}<span className="text-red-500 ml-1">*</span></label>
                        <Dropdown
                            name="currency"
                            value={currency}
                            options={getCurrencyList()}
                            onChange={(e) => setCurrency(e.value)}
                            invalid={!!errors.currency}
                        />
                        {errors.currency && <small className="text-red-500">{errors.currency}</small>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold">{"Totp Issuer"}<span className="text-red-500 ml-1">*</span></label>
                        <InputText
                            name="totpIssuer"
                            value={totpIssuer}
                            onChange={(e) => setTotpIssuer(e.target.value)}
                            placeholder="Enter Totp Issuer"
                            invalid={!!errors.totpIssuer}
                        />
                        {errors.totpIssuer && <small className="text-red-500">{errors.totpIssuer}</small>}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        label={"Cancel"}
                        outlined
                        type="button"
                        onClick={() => navigate("/settings/system")}
                    />
                    <Button label={"Save"} type="submit" icon="pi pi-check" />
                </div>
            </Form>
        </Dialog>
    );
}