import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/supplier.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Supplier } from '../../../core/models/supplier.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationNavComponent } from '../../../shared/components/pagination-nav/pagination-nav.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-supplier-list',
    standalone: true,
    imports: [
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
        EmptyStateComponent,
        PaginationNavComponent,
    ],
    template: `
        <app-page-header title="Proveedores" subtitle="Gestión de proveedores">
            <a routerLink="/admin/proveedores/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        }

        @if (loading()) {
            <app-loading-spinner />
        } @else if (totalElements() === 0) {
            <app-empty-state icon="🏢" title="Sin proveedores" message="Registra tu primer proveedor.">
                <a routerLink="/admin/proveedores/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>RUC</th>
                            <th>Razón social</th>
                            <th>Contacto</th>
                            <th>Teléfono</th>
                            <th>Entrega (días)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>{{ item.ruc }}</td>
                                <td>{{ item.company_name }}</td>
                                <td>{{ item.contact_name || '—' }}</td>
                                <td>{{ item.phone || '—' }}</td>
                                <td>{{ item.delivery_time_days }}</td>
                                <td class="actions">
                                    <a [routerLink]="['/admin/proveedores', item.id]" class="btn-sm btn-secondary">Ver</a>
                                    <a [routerLink]="['/admin/proveedores', item.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
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
export class SupplierListComponent implements OnInit {
    private readonly service = inject(SupplierService);
    private readonly confirmDialog = inject(ConfirmDialogService);

    loading = signal(true);
    error = signal('');
    items = signal<Supplier[]>([]);
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
                this.error.set(extractErrorMessage(err, 'Error al cargar proveedores.'));
                this.loading.set(false);
            },
        });
    }

    changePage(page: number): void {
        this.currentPage.set(page);
        this.load();
    }

    async onDelete(item: Supplier): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar proveedor',
            message: `¿Eliminar "${item.company_name}"?`,
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
