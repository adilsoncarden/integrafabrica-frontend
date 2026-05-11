import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { AuthResponse, LoginRequest } from "../models/auth.model";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private readonly API_URL = "http://localhost:8080/auth";

    // Signal para manejar el estado de autenticación de forma reactiva
    currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

    constructor(private http: HttpClient) {}

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.API_URL}/login`, credentials)
            .pipe(
                tap((response) => {
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("user", JSON.stringify(response));
                    this.currentUser.set(response);
                }),
            );
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.currentUser.set(null);
    }

    getToken(): string | null {
        return localStorage.getItem("token");
    }

    private getUserFromStorage(): AuthResponse | null {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }
}
