import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const isAuthLogin = req.url.includes('/auth/login');

            if (error.status === 401 && !isAuthLogin) {
                authService.logout();
                router.navigate(['/login']);
            }

            if (error.status === 403 && !isAuthLogin && authService.getToken()) {
                authService.logout();
                router.navigate(['/login']);
            }

            return throwError(() => error);
        }),
    );
};
