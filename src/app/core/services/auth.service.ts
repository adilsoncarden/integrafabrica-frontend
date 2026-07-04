import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { toObservable } from "@angular/core/rxjs-interop";
import { Observable, filter, map, of, take, tap } from "rxjs";
import { API_URL } from "../config/api.config";
import { AuthResponse, LoginRequest } from "../models/auth.model";

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly API_AUTH = `${API_URL}/auth`;

    /** False until token/user have been read from localStorage on bootstrap. */
    isAuthReady = signal(false);
    currentUser = signal<AuthResponse | null>(null);

    constructor() {
        this.bootstrapSession();
    }

    private bootstrapSession(): void {
        try {
            const token = this.readTokenFromStorage();
            const user = this.getUserFromStorage();
            this.currentUser.set(token && user ? user : null);
        } finally {
            this.isAuthReady.set(true);
        }
    }

    isAuthenticated(): boolean {
        return (
            this.isAuthReady() &&
            !!this.readTokenFromStorage() &&
            !!this.currentUser()
        );
    }

    /** Emits once when local session restoration has completed. */
    whenReady(): Observable<boolean> {
        if (this.isAuthReady()) {
            return of(true);
        }
        return toObservable(this.isAuthReady).pipe(
            filter((ready) => ready),
            take(1),
            map(() => true),
        );
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.API_AUTH}/login`, credentials)
            .pipe(
                tap((response) => {
                    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
                    localStorage.setItem(
                        USER_STORAGE_KEY,
                        JSON.stringify(response),
                    );
                    this.currentUser.set(response);
                    this.isAuthReady.set(true);
                }),
            );
    }

    logout(): void {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        this.currentUser.set(null);
        this.isAuthReady.set(true);
    }

    getToken(): string | null {
        return this.readTokenFromStorage();
    }

    getUserId(): number | null {
        return this.currentUser()?.userId ?? null;
    }

    private readTokenFromStorage(): string | null {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    }

    private getUserFromStorage(): AuthResponse | null {
        const user = localStorage.getItem(USER_STORAGE_KEY);
        if (!user) {
            return null;
        }
        try {
            return JSON.parse(user) as AuthResponse;
        } catch {
            return null;
        }
    }
}
