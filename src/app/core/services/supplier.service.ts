import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { API_URL } from "../config/api.config";
import { Supplier, SupplierRequest } from "../models/supplier.model";
import { PageResponse } from "../models/page.model";

const UNPAGED_SIZE = 10_000;

@Injectable({ providedIn: "root" })
export class SupplierService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/proveedores`;

    suppliers = signal<Supplier[]>([]);

    getPage(page = 0, size = 10): Observable<PageResponse<Supplier>> {
        return this.http.get<PageResponse<Supplier>>(this.base, {
            params: { page, size },
        });
    }

    getAll(): Observable<Supplier[]> {
        return this.getPage(0, UNPAGED_SIZE).pipe(
            map((response) => response.content),
            tap((items) => this.suppliers.set(items)),
        );
    }

    getById(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.base}/${id}`);
    }

    create(request: SupplierRequest): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.base}/create`, request);
    }

    update(id: number, request: SupplierRequest): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.base}/${id}/update`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}/delete`);
    }
}
