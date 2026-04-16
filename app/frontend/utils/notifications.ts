export const APP_TOAST_EVENT = "app:toast";

type ToastSeverity = "success" | "info" | "warn" | "error";

export interface AppToastEventDetail {
	severity: ToastSeverity;
	detail: string;
	summary?: string;
	life?: number;
	sticky?: boolean;
}

interface NotifyOptions {
	summary?: string;
	life?: number;
	sticky?: boolean;
}

function toMessage(msg: unknown): string {
	if (typeof msg === "string") {
		return msg;
	}
	if (msg instanceof Error) {
		return msg.message;
	}
	return String(msg);
}

function emitToast(severity: ToastSeverity, msg: unknown, options?: NotifyOptions) {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(
		new CustomEvent<AppToastEventDetail>(APP_TOAST_EVENT, {
			detail: {
				severity,
				detail: toMessage(msg),
				summary: options?.summary,
				life: options?.life ?? 5000,
				sticky: options?.sticky,
			},
		}),
	);
}

export function notifyInfo(msg: unknown, options?: NotifyOptions) {
	emitToast("info", msg, options);
}

export function notifyError(msg: unknown, options?: NotifyOptions) {
	emitToast("error", msg, options);
}
