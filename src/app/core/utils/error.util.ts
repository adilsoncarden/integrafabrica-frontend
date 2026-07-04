import { HttpErrorResponse } from "@angular/common/http";
import { ApiErrorResponse } from "../models/api-error.model";
import { AuthService } from "../services/auth.service";

const TRANSIENT_AUTH_MESSAGE = "servicio de autenticación no disponible";

export function isTransientAuthError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse) || error.status !== 503) {
        return false;
    }
    return containsAuthUnavailableMessage(error.error);
}

/** Suppress false-positive auth toasts during bootstrap or transient backend auth failures. */
export function shouldSuppressErrorToast(
    error: unknown,
    authService: AuthService,
): boolean {
    if (!authService.isAuthReady()) {
        return true;
    }
    if (isTransientAuthError(error)) {
        return true;
    }
    if (!(error instanceof HttpErrorResponse)) {
        return false;
    }
    if (error.status === 401 || error.status === 403) {
        if (!authService.isAuthenticated()) {
            return true;
        }
        return containsAuthUnavailableMessage(error.error);
    }
    return false;
}

function containsAuthUnavailableMessage(body: unknown): boolean {
    if (typeof body === "string") {
        return body.toLowerCase().includes(TRANSIENT_AUTH_MESSAGE);
    }
    if (body && typeof body === "object" && "message" in body) {
        const message = String((body as ApiErrorResponse).message ?? "");
        return message.toLowerCase().includes(TRANSIENT_AUTH_MESSAGE);
    }
    return false;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
    if (isTransientAuthError(error)) {
        return fallback;
    }
    if (error instanceof HttpErrorResponse) {
        const body = error.error as ApiErrorResponse | string;
        if (typeof body === "string" && body.length > 0) {
            return body;
        }
        if (body && typeof body === "object") {
            if (body.message) {
                return body.message;
            }
            if (body.errors) {
                return Object.values(body.errors).join(". ");
            }
        }
    }
    return fallback;
}
