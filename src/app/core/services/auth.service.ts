import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AuthResponse, LoginRequest } from '../models/auth.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly API_AUTH = `${API_URL}/auth`;

    currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

    constructor(private http: HttpClient) {}

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.API_AUTH}/login`, credentials)
            .pipe(
                tap((response) => {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response));
                    this.currentUser.set(response);
                }),
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser.set(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserId(): number | null {
        return this.currentUser()?.userId ?? null;
    }

    private getUserFromStorage(): AuthResponse | null {
        const user = localStorage.getItem('user');
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
