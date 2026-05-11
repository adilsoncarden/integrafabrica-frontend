import { Component } from "@angular/core";
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

    onSubmit() {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: () => this.router.navigate(["/admin/dashboard"]),
                error: () =>
                    (this.errorMessage =
                        "Credenciales incorrectas. Intente de nuevo."),
            });
        }
    }
}
