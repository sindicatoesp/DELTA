export interface InstanceSystemSettings {
	id: string;
	footerUrlPrivacyPolicy: string | null;
	footerUrlTermsConditions: string | null;
	websiteLogo: string;
	websiteName: string;
	approvedRecordsArePublic: boolean;
	totpIssuer: string;
	dtsInstanceType: string;
	dtsInstanceCtryIso3: string;
	currencyCode: string;
	countryName: string;
	countryAccountsId: string | null;
	language: string;
}

export interface CreateInstanceSystemSettingsData {
	footerUrlPrivacyPolicy?: string | null;
	footerUrlTermsConditions?: string | null;
	websiteLogo?: string;
	websiteName?: string;
	approvedRecordsArePublic?: boolean;
	totpIssuer?: string;
	dtsInstanceType?: string;
	dtsInstanceCtryIso3?: string;
	currencyCode?: string;
	countryName?: string;
	countryAccountsId?: string | null;
	language?: string;
}

export interface UpdateInstanceSystemSettingsData {
	footerUrlPrivacyPolicy?: string | null;
	footerUrlTermsConditions?: string | null;
	websiteLogo?: string;
	websiteName?: string;
	approvedRecordsArePublic?: boolean;
	totpIssuer?: string;
	currencyCode?: string;
	language?: string;
}
