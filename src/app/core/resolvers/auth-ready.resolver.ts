import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Ensures auth session is restored before activating admin child routes. */
export const authReadyResolver: ResolveFn<boolean> = () => {
    const authService = inject(AuthService);
    return authService.whenReady().pipe(map(() => true));
};
