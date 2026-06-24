import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Product } from '../../../core/models/product.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationNavComponent } from '../../../shared/components/pagination-nav/pagination-nav.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
        EmptyStateComponent,
        PaginationNavComponent,
    ],
    template: `
        <app-page-header title="Productos" subtitle="Inventario de productos">
            <a routerLink="/admin/productos/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        }

        @if (loading()) {
            <app-loading-spinner />
        } @else if (totalElements() === 0) {
            <app-empty-state icon="📦" title="Sin productos" message="Registra tu primer producto.">
                <a routerLink="/admin/productos/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>SKU</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Ubicación</th>
                            <th>Stock</th>
                            <th>Mín.</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>{{ item.sku }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.category.name }}</td>
                                <td>{{ item.location.aisle }}-{{ item.location.rack }}-{{ item.location.level }}</td>
                                <td>
                                    {{ item.stock }}
                                    @if (item.stock < item.minStock) {
                                        <span class="badge warning">Bajo</span>
                                    }
                                </td>
                                <td>{{ item.minStock }}</td>
                                <td class="actions">
                                    <a [routerLink]="['/admin/productos', item.id]" class="btn-sm btn-secondary">Ver</a>
                                    <a [routerLink]="['/admin/productos', item.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
                                    <button type="button" class="btn-sm btn-danger" (click)="onDelete(item)">Eliminar</button>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
                <app-pagination-nav
                    [currentPage]="currentPage()"
                    [pageSize]="pageSize()"
                    [totalElements]="totalElements()"
                    (pageChange)="changePage($event)"
                />
            </div>
        }
    `,
    styles: `.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }`,
})
export class ProductListComponent implements OnInit {
    private readonly service = inject(ProductService);
    private readonly confirmDialog = inject(ConfirmDialogService);

    loading = signal(true);
    error = signal('');
    items = signal<Product[]>([]);
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.service.getPage(this.currentPage(), this.pageSize()).subscribe({
            next: (page) => {
                this.items.set(page.content);
                this.totalElements.set(page.totalElements);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al cargar productos.'));
                this.loading.set(false);
            },
        });
    }

    changePage(page: number): void {
        this.currentPage.set(page);
        this.load();
    }

    async onDelete(item: Product): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar producto',
            message: `¿Eliminar "${item.name}"?`,
            danger: true,
            confirmLabel: 'Eliminar',
        });
        if (!confirmed) return;

        this.service.delete(item.id).subscribe({
            next: () => this.load(),
            error: (err) => this.error.set(extractErrorMessage(err, 'Error al eliminar.')),
        });
    }
}
