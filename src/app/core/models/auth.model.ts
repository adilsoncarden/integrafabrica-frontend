export interface LoginRequest {
    identifier: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    role: string;
    username: string;
    userId: number;
}
