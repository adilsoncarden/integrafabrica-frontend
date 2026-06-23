import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Category, CategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/categorias`;

    categories = signal<Category[]>([]);

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.base).pipe(
            tap((items) => this.categories.set(items)),
        );
    }

    getById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.base}/${id}`);
    }

    create(request: CategoryRequest): Observable<Category> {
        return this.http.post<Category>(`${this.base}/create`, request);
    }

    update(id: number, request: CategoryRequest): Observable<Category> {
        return this.http.put<Category>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
