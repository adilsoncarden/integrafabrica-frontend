import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { ProductBatch, ProductBatchRequest } from '../models/product-batch.model';

@Injectable({ providedIn: 'root' })
export class ProductBatchService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/lotes`;

    batches = signal<ProductBatch[]>([]);

    getAll(): Observable<ProductBatch[]> {
        return this.http.get<ProductBatch[]>(this.base).pipe(
            tap((items) => this.batches.set(items)),
        );
    }

    getByProduct(productId: number): Observable<ProductBatch[]> {
        return this.http.get<ProductBatch[]>(`${this.base}/producto/${productId}`);
    }

    getById(id: number): Observable<ProductBatch> {
        return this.http.get<ProductBatch>(`${this.base}/${id}`);
    }

    create(request: ProductBatchRequest): Observable<ProductBatch> {
        return this.http.post<ProductBatch>(`${this.base}/create`, request);
    }

    update(id: number, request: ProductBatchRequest): Observable<ProductBatch> {
        return this.http.put<ProductBatch>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
