import { Component, OnInit, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../core/services/auth.service";

@Component({
    selector: "app-dashboard",
    standalone: true,
    template: `
        <div class="p-5">
            <h1>Dashboard de Administración</h1>
            <div class="alert alert-success">
                {{ welcomeMessage }}
            </div>
            <p>
                Bienvenido,
                <strong>{{ authService.currentUser()?.username }}</strong>
            </p>
            <button (click)="logout()" class="btn btn-danger">
                Cerrar Sesión
            </button>
        </div>
    `,
})
export class DashboardComponent implements OnInit {
    welcomeMessage: string = "";
    authService = inject(AuthService);
    private http = inject(HttpClient);

    ngOnInit() {
        this.http
            .get("http://localhost:8080/admin/dashboard", {
                responseType: "text",
            })
            .subscribe((res) => (this.welcomeMessage = res));
    }

    logout() {
        this.authService.logout();
        window.location.href = "/login";
    }
}
