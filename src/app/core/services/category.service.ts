import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { API_URL } from "../config/api.config";
import { Category, CategoryRequest } from "../models/category.model";
import { PageResponse } from "../models/page.model";

const UNPAGED_SIZE = 10_000;

@Injectable({ providedIn: "root" })
export class CategoryService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/categorias`;

    categories = signal<Category[]>([]);

    getPage(page = 0, size = 10): Observable<PageResponse<Category>> {
        return this.http.get<PageResponse<Category>>(this.base, {
            params: { page, size },
        });
    }

    getAll(): Observable<Category[]> {
        return this.getPage(0, UNPAGED_SIZE).pipe(
            map((response) => response.content),
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
