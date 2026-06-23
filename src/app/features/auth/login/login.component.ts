import { Component, signal } from "@angular/core";
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: "./login.component.html",
    styleUrls: ['../../../styles/_login.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage: string = "";
    showPassword = signal<boolean>(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) {
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
            this.errorMessage = '';
            this.authService.login(this.loginForm.value).subscribe({
                next: () => this.router.navigate(['/admin/dashboard']),
                error: (err) => {
                    if (err.status === 401) {
                        this.errorMessage =
                            'Credenciales incorrectas. Intente de nuevo.';
                    } else {
                        this.errorMessage =
                            'No se pudo iniciar sesión. Verifique el servidor.';
                    }
                },
            });
        }
    }
}
