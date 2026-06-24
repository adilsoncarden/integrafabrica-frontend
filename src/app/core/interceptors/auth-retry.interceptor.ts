import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError, timer } from 'rxjs';
import { isTransientAuthError } from '../utils/error.util';

const RETRY_DELAY_MS = 500;
const TOKEN_STORAGE_KEY = 'token';

function readTokenSync(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function isRetryableAuthFailure(error: HttpErrorResponse): boolean {
    if (isTransientAuthError(error)) {
        return true;
    }
    // Transient 401 while a valid token exists (session sync / JWT validation race).
    return error.status === 401 && !!readTokenSync();
}

/**
 * Retries GET requests once on transient auth failures (503 or 401 with active token).
 */
export const authRetryInterceptor: HttpInterceptorFn = (req, next) => {
    const canRetry = req.method === 'GET' && !req.url.includes('/auth/login');

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (!canRetry || !isRetryableAuthFailure(error)) {
                return throwError(() => error);
            }
            return timer(RETRY_DELAY_MS).pipe(switchMap(() => next(req)));
        }),
    );
};
