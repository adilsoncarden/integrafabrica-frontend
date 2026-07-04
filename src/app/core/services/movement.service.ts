import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { API_URL } from "../config/api.config";
import { Movement, MovementRequest } from "../models/movement.model";
import { PageResponse } from "../models/page.model";

const UNPAGED_SIZE = 10_000;

@Injectable({ providedIn: "root" })
export class MovementService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/movimientos`;

    movements = signal<Movement[]>([]);

    getPage(page = 0, size = 10): Observable<PageResponse<Movement>> {
        return this.http.get<PageResponse<Movement>>(this.base, {
            params: { page, size },
        });
    }

    getByTypePage(
        type: string,
        page = 0,
        size = 10,
    ): Observable<PageResponse<Movement>> {
        return this.http.get<PageResponse<Movement>>(`${this.base}/filtrar`, {
            params: { type, page, size },
        });
    }

    getAll(): Observable<Movement[]> {
        return this.getPage(0, UNPAGED_SIZE).pipe(
            map((response) => response.content),
            tap((items) => this.movements.set(items)),
        );
    }

    getByType(type: string): Observable<Movement[]> {
        return this.getByTypePage(type, 0, UNPAGED_SIZE).pipe(
            map((response) => response.content),
            tap((items) => this.movements.set(items)),
        );
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
