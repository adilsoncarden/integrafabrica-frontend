import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Product } from '../models/product.model';
import { ProductBatch } from '../models/product-batch.model';
import { Movement } from '../models/movement.model';

export interface DashboardData {
    totalStock: number;
    productCount: number;
    batchCount: number;
    movementCount: number;
    categoryCount: number;
    lowStockProducts: Product[];
    expiringBatches: ProductBatch[];
    recentMovements: Movement[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly base = `${API_URL}/admin/dashboard`;

    loadDashboard(): Observable<DashboardData> {
        return this.http.get<DashboardData>(this.base);
    }
}
