import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useNavigate } from "react-router";
import { Button } from "primereact/button";

import { PERMISSIONS } from "~/frontend/user/roles";
import { NavSettings } from "~/frontend/components/nav-settings";
import { MainContainer } from "~/frontend/container";
import { getSystemInfo } from "~/db/queries/dtsSystemInfo";
import { CountryAccountsRepository } from "~/db/queries/countryAccountsRepository";
import { CountryRepository } from "~/db/queries/countriesRepository";
import { configApplicationEmail, configPublicUrl } from "~/utils/config";
import { htmlTitle } from "~/utils/htmlmeta";
import { requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession, getUserRoleFromSession } from "~/utils/session";
import { makeGetSystemSettingsPageDataUseCase } from "~/modules/system-settings/system-settings-module.server";

export async function loader({ request }: LoaderFunctionArgs) {
	await requirePermission(request, PERMISSIONS.COUNTRY_SETTINGS_MANAGE);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const systemSettingsData = await makeGetSystemSettingsPageDataUseCase().execute({
		countryAccountsId,
	});
	const countryAccount = countryAccountsId
		? await CountryAccountsRepository.getById(countryAccountsId)
		: null;
	const country = countryAccount
		? await CountryRepository.getById(countryAccount.countryId)
		: null;
	const dtsSystemInfo = await getSystemInfo();
	const confEmailObj = configApplicationEmail();
	const userRole = await getUserRoleFromSession(request);

	return {
		publicURL: configPublicUrl(),
		currencyArray: systemSettingsData.currencyArray,
		availableLanguages: systemSettingsData.availableLanguages,
		systemLanguage: systemSettingsData.systemLanguage,
		confEmailObj,
		instanceSystemSettings: systemSettingsData.instanceSystemSettings,
		dtsSystemInfo,
		country,
		userRole: userRole || "",
		countryAccountType: countryAccount?.type,
	};
}

export const meta: MetaFunction = () => {
	return [
		{
			title: htmlTitle("System Settings"),
		},
		{
			name: "description",
			content: "System Settings",
		},
	];
};

export default function SettingsSystemPage() {
	const loaderData = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const navSettings = <NavSettings userRole={loaderData.userRole} />;

	return (
		<>
			<MainContainer title={"System settings"} headerExtra={navSettings}>
				<div className="mg-container">
					<div className="dts-page-intro">
						<div className="dts-additional-actions">
							<Button
								type="button"
								icon="pi pi-pencil"
								label={"Edit Settings"}
								onClick={() => navigate("/settings/system/edit")}
							></Button>
						</div>
					</div>

					<div className="flex flex-col gap-6">
						<section className="border border-gray-200 rounded-lg overflow-hidden">
							<div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-5 py-3">
								<i className="pi pi-globe text-[#004F91]" />
								<span className="font-semibold text-gray-700">{"Country instance"}</span>
							</div>
							<dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
								{[
									{ label: "Country", value: loaderData.country?.name },
									{
										label: "Type",
										value: loaderData.countryAccountType
											? `${loaderData.countryAccountType} instance`
											: undefined,
									},
									{
										label: "ISO 3",
										value: loaderData.instanceSystemSettings?.dtsInstanceCtryIso3,
									},
									{
										label: "Instance type",
										value: loaderData.instanceSystemSettings?.approvedRecordsArePublic
											? "Public"
											: "Private",
									},
									{ label: "Language", value: loaderData.instanceSystemSettings?.language },
									{ label: "Currency", value: loaderData.instanceSystemSettings?.currencyCode },
								].map(({ label, value }) => (
									<div key={label} className="flex flex-col gap-1 px-5 py-4">
										<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
										<dd className="text-sm font-semibold text-gray-900">{value ?? <span className="text-gray-400 font-normal">-</span>}</dd>
									</div>
								))}
							</dl>
						</section>

						<section className="border border-gray-200 rounded-lg overflow-hidden">
							<div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-5 py-3">
								<i className="pi pi-cog text-[#004F91]" />
								<span className="font-semibold text-gray-700">{"Instance configuration"}</span>
							</div>
							<dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
								{[
									{ label: "Instance Name", value: loaderData.instanceSystemSettings?.websiteName },
									{ label: "Application URL", value: loaderData.publicURL },
									{ label: "Instance Logo URL", value: loaderData.instanceSystemSettings?.websiteLogo },
									{ label: "2FA/TOTP Issuer Name", value: loaderData.instanceSystemSettings?.totpIssuer },
									{ label: "Privacy Policy URL", value: loaderData.instanceSystemSettings?.footerUrlPrivacyPolicy },
									{ label: "Terms & Conditions URL", value: loaderData.instanceSystemSettings?.footerUrlTermsConditions },
								].map(({ label, value }) => (
									<div key={label} className="flex flex-col gap-1 px-5 py-4">
										<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
										<dd className="text-sm font-semibold text-gray-900 break-all">{value ?? <span className="text-gray-400 font-normal">-</span>}</dd>
									</div>
								))}
							</dl>
						</section>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<section className="border border-gray-200 rounded-lg overflow-hidden">
								<div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-5 py-3">
									<i className="pi pi-info-circle text-[#004F91]" />
									<span className="font-semibold text-gray-700">{"Software"}</span>
								</div>
								<div className="flex flex-col gap-1 px-5 py-4">
									<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{"DELTA Resilience version"}</dt>
									<dd className="text-sm font-semibold text-gray-900">
										{loaderData.dtsSystemInfo?.versionNo ?? <span className="text-gray-400 font-normal">-</span>}
									</dd>
								</div>
							</section>

							<section className="border border-gray-200 rounded-lg overflow-hidden">
								<div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-5 py-3">
									<i className="pi pi-envelope text-[#004F91]" />
									<span className="font-semibold text-gray-700">{"Email routing"}</span>
								</div>
								<dl className="divide-y divide-gray-100">
									{[
										{ label: "Transport", value: loaderData.confEmailObj.EMAIL_TRANSPORT },
										...(loaderData.confEmailObj.EMAIL_TRANSPORT === "smtp"
											? [
												{ label: "Host", value: loaderData.confEmailObj.SMTP_HOST ?? "Not set" },
												{ label: "Port", value: loaderData.confEmailObj.SMTP_PORT ?? "Not set" },
												{ label: "Secure", value: loaderData.confEmailObj.SMTP_SECURE ? "Yes" : "No" },
											]
											: []),
									].map(({ label, value }) => (
										<div key={label} className="flex flex-col gap-1 px-5 py-4">
											<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
											<dd className="text-sm font-semibold text-gray-900">{value ?? <span className="text-gray-400 font-normal">-</span>}</dd>
										</div>
									))}
								</dl>
							</section>
						</div>
					</div>
				</div>
			</MainContainer>
			<Outlet />
		</>
	);
}