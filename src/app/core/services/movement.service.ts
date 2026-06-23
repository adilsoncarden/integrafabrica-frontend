import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Movement, MovementRequest } from '../models/movement.model';

@Injectable({ providedIn: 'root' })
export class MovementService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/movimientos`;

    movements = signal<Movement[]>([]);

    getAll(): Observable<Movement[]> {
        return this.http.get<Movement[]>(this.base).pipe(
            tap((items) => this.movements.set(items)),
        );
    }

    getByType(type: string): Observable<Movement[]> {
        return this.http.get<Movement[]>(`${this.base}/filtrar`, {
            params: { type },
        });
    }

    getById(id: number): Observable<Movement> {
        return this.http.get<Movement>(`${this.base}/${id}`);
    }

    create(request: MovementRequest): Observable<Movement> {
        return this.http.post<Movement>(`${this.base}/create`, request);
    }

    update(id: number, request: MovementRequest): Observable<Movement> {
        return this.http.put<Movement>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
