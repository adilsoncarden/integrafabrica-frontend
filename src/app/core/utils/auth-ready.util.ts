import { effect, inject, Injector, runInInjectionContext } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Defers the initial data load until auth bootstrap completes and the user is authenticated.
 * Uses an Angular effect so protected API calls never race ahead of session restoration.
 */
export function setupAuthGuardedInitialLoad(load: () => void, injector?: Injector): void {
    const inj = injector ?? inject(Injector);
    runInInjectionContext(inj, () => {
        const authService = inject(AuthService);
        let triggered = false;

        effect(() => {
            if (authService.isAuthReady() && authService.isAuthenticated() && !triggered) {
                triggered = true;
                load();
            }
        });
    });
}
