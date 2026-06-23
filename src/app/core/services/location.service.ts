import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Location, LocationRequest } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/ubicaciones`;

    locations = signal<Location[]>([]);

    getAll(): Observable<Location[]> {
        return this.http.get<Location[]>(this.base).pipe(
            tap((items) => this.locations.set(items)),
        );
    }

    getById(id: number): Observable<Location> {
        return this.http.get<Location>(`${this.base}/${id}`);
    }

    create(request: LocationRequest): Observable<Location> {
        return this.http.post<Location>(`${this.base}/create`, request);
    }

    update(id: number, request: LocationRequest): Observable<Location> {
        return this.http.put<Location>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
