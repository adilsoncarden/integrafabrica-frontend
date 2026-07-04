import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideToastr } from "ngx-toastr";
import { provideSweetAlert2 } from "@sweetalert2/ngx-sweetalert2";
import { routes } from "./app.routes";
import { jwtInterceptor } from "./core/interceptors/jwt.interceptor";
import { authRetryInterceptor } from "./core/interceptors/auth-retry.interceptor";
import { errorInterceptor } from "./core/interceptors/error.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([
                jwtInterceptor,
                authRetryInterceptor,
                errorInterceptor,
            ]),
        ),
        provideAnimations(),
        provideToastr({
            timeOut: 4000,
            extendedTimeOut: 2000,
            positionClass: "toast-top-right",
            preventDuplicates: true,
            progressBar: true,
            closeButton: true,
            newestOnTop: true,
            tapToDismiss: true,
        }),
        provideSweetAlert2({
            fireOnInit: false,
            dismissOnDestroy: true,
        }),
    ],
};
