import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

const TOKEN_STORAGE_KEY = 'token';

function isPublicRequest(url: string): boolean {
    return url.includes('/auth/login');
}

/** Reads JWT synchronously from storage — avoids race with AuthService signal hydration. */
function readTokenSync(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    if (isPublicRequest(req.url)) {
        return next(req);
    }

    const authService = inject(AuthService);

    const dispatch = () => {
        const token = readTokenSync();
        if (token) {
            return next(
                req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );
        }
        return next(req);
    };

    if (authService.isAuthReady()) {
        return dispatch();
    }

    return authService.whenReady().pipe(take(1), switchMap(() => dispatch()));
};
