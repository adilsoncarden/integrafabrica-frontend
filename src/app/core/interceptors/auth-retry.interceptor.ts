import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError, timer } from 'rxjs';
const RETRY_DELAY_MS = 500;
const TOKEN_STORAGE_KEY = 'token';

function readTokenSync(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function isRetryableAuthFailure(error: HttpErrorResponse): boolean {
    // Transient 401 while a valid token exists (session sync / JWT validation race).
    return error.status === 401 && !!readTokenSync();
}

/**
 * Retries GET requests once on transient 401 while a valid token exists.
 * Does not retry 503 — retries would double JDBC load during pool exhaustion.
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
