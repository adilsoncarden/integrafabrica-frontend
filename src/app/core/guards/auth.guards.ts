import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.whenReady().pipe(
        map(() => {
            if (authService.isAuthenticated()) {
                return true;
            }
            authService.logout();
            return router.createUrlTree(["/login"]);
        }),
    );
};
