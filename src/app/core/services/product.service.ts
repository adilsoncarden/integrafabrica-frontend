import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Product, ProductRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/productos`;

    products = signal<Product[]>([]);

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.base).pipe(
            tap((items) => this.products.set(items)),
        );
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.base}/${id}`);
    }

    create(request: ProductRequest): Observable<Product> {
        return this.http.post<Product>(`${this.base}/create`, request);
    }

    update(id: number, request: ProductRequest): Observable<Product> {
        return this.http.put<Product>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
