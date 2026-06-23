import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { CategoryService } from './category.service';
import { ProductBatchService } from './product-batch.service';
import { ProductService } from './product.service';
import { MovementService } from './movement.service';
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
    private readonly categoryService = inject(CategoryService);
    private readonly productService = inject(ProductService);
    private readonly batchService = inject(ProductBatchService);
    private readonly movementService = inject(MovementService);

    loadDashboard(): Observable<DashboardData> {
        return forkJoin({
            categories: this.categoryService.getAll(),
            products: this.productService.getAll(),
            batches: this.batchService.getAll(),
            movements: this.movementService.getAll(),
        }).pipe(
            map(({ categories, products, batches, movements }) => {
                const totalStock = products.reduce((sum, p) => sum + Number(p.stock), 0);
                const lowStockProducts = products.filter(
                    (p) => Number(p.stock) < Number(p.minStock),
                );
                const now = new Date();
                const in30Days = new Date();
                in30Days.setDate(now.getDate() + 30);
                const expiringBatches = batches.filter((b) => {
                    const exp = new Date(b.expiration_date);
                    return exp >= now && exp <= in30Days;
                });
                const recentMovements = [...movements]
                    .sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                    )
                    .slice(0, 5);

                return {
                    totalStock,
                    productCount: products.length,
                    batchCount: batches.length,
                    movementCount: movements.length,
                    categoryCount: categories.length,
                    lowStockProducts,
                    expiringBatches,
                    recentMovements,
                };
            }),
        );
    }
}
