export type LangRouteParam = {
	params: { lang?: string };
};

export const VALID_LANGUAGES = ["en"]; // Only English supported

export const DEFAULT_LANGUAGE = "en";

// Translation removed - always return English
export function getLanguageAllowDefault(_args?: LangRouteParam): string {
	return DEFAULT_LANGUAGE;
}

// Translation removed - always return English
export function getLanguage(_args?: LangRouteParam): string {
	return DEFAULT_LANGUAGE;
}

// Translation removed - always valid in English
export function ensureValidLanguage(_args?: LangRouteParam) {
	// No-op - English is always valid
}
