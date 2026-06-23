import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProductBatchService } from '../../../core/services/product-batch.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ProductBatch } from '../../../core/models/product-batch.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-batch-list',
    standalone: true,
    imports: [
        RouterLink,
        DatePipe,
        PageHeaderComponent,
        LoadingSpinnerComponent,
        EmptyStateComponent,
    ],
    template: `
        <app-page-header title="Lotes" subtitle="Gestión de lotes de productos">
            <a routerLink="/admin/lotes/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        }

        @if (loading()) {
            <app-loading-spinner />
        } @else if (items().length === 0) {
            <app-empty-state icon="🧪" title="Sin lotes" message="Registra tu primer lote.">
                <a routerLink="/admin/lotes/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Vencimiento</th>
                            <th>Inicial</th>
                            <th>Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>{{ item.batch_code }}</td>
                                <td>{{ item.product.name }}</td>
                                <td>{{ item.expiration_date | date: 'dd/MM/yyyy' }}</td>
                                <td>{{ item.initial_quantity }}</td>
                                <td>{{ item.current_quantity }}</td>
                                <td class="actions">
                                    <a [routerLink]="['/admin/lotes', item.id]" class="btn-sm btn-secondary">Ver</a>
                                    <a [routerLink]="['/admin/lotes', item.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
                                    <button type="button" class="btn-sm btn-danger" (click)="onDelete(item)">Eliminar</button>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        }
    `,
    styles: `.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }`,
})
export class BatchListComponent implements OnInit {
    private readonly service = inject(ProductBatchService);
    private readonly confirmDialog = inject(ConfirmDialogService);

    loading = signal(true);
    error = signal('');
    items = this.service.batches;

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.service.getAll().subscribe({
            next: () => this.loading.set(false),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al cargar lotes.'));
                this.loading.set(false);
            },
        });
    }

    async onDelete(item: ProductBatch): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar lote',
            message: `¿Eliminar lote "${item.batch_code}"?`,
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
