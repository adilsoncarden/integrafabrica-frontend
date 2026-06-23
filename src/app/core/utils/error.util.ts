import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api-error.model';

export function extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
        const body = error.error as ApiErrorResponse | string;
        if (typeof body === 'string' && body.length > 0) {
            return body;
        }
        if (body && typeof body === 'object') {
            if (body.message) {
                return body.message;
            }
            if (body.errors) {
                return Object.values(body.errors).join('. ');
            }
        }
    }
    return fallback;
}
