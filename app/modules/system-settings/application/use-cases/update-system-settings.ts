import { checkValidCurrency } from "~/utils/currency";
import type { InstanceSystemSettings } from "~/modules/system-settings/domain/entities/instance-system-settings";
import type { InstanceSystemSettingsRepositoryPort } from "~/modules/system-settings/domain/repositories/instance-system-settings-repository";

export class SystemSettingsValidationError extends Error {
	errors: Record<string, string>;

	constructor(errors: Record<string, string>) {
		super("Validation Error");
		this.errors = errors;
	}
}

interface UpdateSystemSettingsInput {
	id: string | null;
	privacyUrl: string | null;
	termsUrl: string | null;
	websiteLogoUrl: string;
	websiteName: string;
	isApprovedRecordsPublic: boolean;
	totpIssuer: string;
	currency: string;
	language: string;
}

export class UpdateSystemSettingsUseCase {
	constructor(
		private readonly repository: InstanceSystemSettingsRepositoryPort,
	) {}

	async execute(
		input: UpdateSystemSettingsInput,
	): Promise<{ instanceSystemSettings: InstanceSystemSettings | null }> {
		const errors: Record<string, string> = {};

		if (!input.id) {
			errors.id = "Instance system settings Id is required";
		}

		if (!input.websiteLogoUrl || input.websiteLogoUrl.trim().length === 0) {
			errors.websiteLogoUrl = "Website logo URL is required";
		}

		if (!input.websiteName || input.websiteName.trim().length === 0) {
			errors.websiteName = "Website name is required";
		}

		if (!input.totpIssuer || input.totpIssuer.trim().length === 0) {
			errors.totpIssuer = "Totp Issuer is required";
		}

		const privacyUrl =
			input.privacyUrl && input.privacyUrl.trim().length > 0
				? input.privacyUrl
				: null;
		const termsUrl =
			input.termsUrl && input.termsUrl.trim().length > 0
				? input.termsUrl
				: null;

		if (
			input.isApprovedRecordsPublic === null ||
			input.isApprovedRecordsPublic === undefined
		) {
			errors.approvedRecordsArePublic =
				"Approved records visibility is required";
		}

		if (!checkValidCurrency(input.currency)) {
			errors.currency = "Invalid currency";
		}

		if (input.language !== "en") {
			errors.language = "Only English (en) is supported";
		}

		if (Object.keys(errors).length > 0) {
			throw new SystemSettingsValidationError(errors);
		}

		const instanceSystemSettings = await this.repository.update(
			input.id as string,
			{
				footerUrlPrivacyPolicy: privacyUrl,
				footerUrlTermsConditions: termsUrl,
				websiteLogo: input.websiteLogoUrl,
				websiteName: input.websiteName,
				approvedRecordsArePublic: input.isApprovedRecordsPublic,
				totpIssuer: input.totpIssuer,
				currencyCode: input.currency,
				language: input.language,
			},
		);

		return { instanceSystemSettings };
	}
}
