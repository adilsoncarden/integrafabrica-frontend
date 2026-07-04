import { Component, inject, signal } from "@angular/core";
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: "./login.component.html",
    styleUrls: ["../../../styles/_login.scss"],
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    loginForm: FormGroup;
    showPassword = signal<boolean>(false);

    constructor() {
        this.loginForm = this.fb.group({
            identifier: ["", [Validators.required]],
            password: ["", [Validators.required, Validators.minLength(4)]],
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword.update((v) => !v);
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: () => this.router.navigate(["/admin/dashboard"]),
                error: (err) => {
                    if (err.status === 401) {
                        this.toast.error(
                            "Credenciales incorrectas. Intente de nuevo.",
                        );
                    } else {
                        this.toast.error(
                            "No se pudo iniciar sesión. Verifique el servidor.",
                        );
                    }
                },
            });
        }
    }
}
