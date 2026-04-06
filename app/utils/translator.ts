// Translation system has been removed - all translations use English fallbacks
// These types are kept for backward compatibility with existing code that uses ctx.t()

export type ParsedLanguage = {
	baseLang: string;
	isDebug: boolean;
};

export function parseLanguageAndDebugFlag(_lang: string): ParsedLanguage {
	// Always use English
	return { baseLang: "en", isDebug: false };
}

type Message = string | string[];

export type Translation = {
	msg?: Message;
	msgs?: Record<string, Message>;
};

export type TParams = {
	code: string;
	desc?: string;
} & Translation;

export type TranslationGetter = (params: TParams) => Translation;

export type Translator = (
	params: TParams,
	replacements?: Record<string, any> | undefined | null,
) => string;

export function createTranslator(
	_translationGetter: TranslationGetter,
	_lang: string,
	_debug: boolean,
): Translator {
	// Translation system removed - directly use English fallback messages only
	return function (params, replacements) {
		// Ensure a message is provided as fallback
		if (!params.msg && !params.msgs) {
			throw new Error(
				`Translation fallback message required for code: ${params.code}. ` +
					`Please provide 'msg' or 'msgs' property in the translation call.`,
			);
		}

		let str: string;

		if (params.msgs !== undefined) {
			// Use "other" form for singular (English doesn't have complex plural rules)
			const msgValue = params.msgs.other ?? Object.values(params.msgs)[0];
			str = typeof msgValue === "string" ? msgValue : msgValue.join("\n");
		} else {
			str = params.msg as string;
		}

		// Apply replacements: {key} -> value
		if (replacements) {
			for (const [key, value] of Object.entries(replacements)) {
				str = str.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
			}
		}

		return str;
	};
}

export function createMockTranslator(): Translator {
	return function (
		params: TParams,
		replacements?: Record<string, any> | null,
	): string {
		let strOrArr: string | string[];

		// Handle plural: pick first available key in msgs
		if (params.msgs !== undefined) {
			const msgs = params.msgs;
			const keys = Object.keys(msgs);

			const preferredKey = keys.length > 0 ? keys.sort()[0] : null;

			if (preferredKey && msgs[preferredKey] !== undefined) {
				strOrArr = msgs[preferredKey];
			} else {
				strOrArr = `No valid form in msgs for ${params.code}`;
			}
		}
		// Handle singular
		else if (params.msg !== undefined) {
			strOrArr = params.msg;
		}
		// Nothing provided
		else {
			return `Translation missing for ${params.code}`;
		}

		// Normalize to string
		let str = Array.isArray(strOrArr) ? strOrArr.join("\n") : strOrArr;

		// Apply replacements: {key} → value
		if (replacements) {
			for (const [key, value] of Object.entries(replacements)) {
				str = str.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
			}
		}

		return str;
	};
}
