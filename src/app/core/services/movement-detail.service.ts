import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { MovementDetail, MovementDetailRequest } from '../models/movement-detail.model';

@Injectable({ providedIn: 'root' })
export class MovementDetailService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/detalles-movimiento`;

    details = signal<MovementDetail[]>([]);

    getByMovement(movementId: number): Observable<MovementDetail[]> {
        return this.http
            .get<MovementDetail[]>(`${this.base}/movimiento/${movementId}`)
            .pipe(tap((items) => this.details.set(items)));
    }

    getById(id: number): Observable<MovementDetail> {
        return this.http.get<MovementDetail>(`${this.base}/${id}`);
    }

    create(request: MovementDetailRequest): Observable<MovementDetail> {
        return this.http.post<MovementDetail>(`${this.base}/add`, request);
    }

    update(id: number, request: MovementDetailRequest): Observable<MovementDetail> {
        return this.http.put<MovementDetail>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
