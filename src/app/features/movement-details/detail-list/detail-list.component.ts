import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MovementService } from '../../../core/services/movement.service';
import { MovementDetailService } from '../../../core/services/movement-detail.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { MovementDetail } from '../../../core/models/movement-detail.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-detail-list',
    standalone: true,
    imports: [
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
        EmptyStateComponent,
    ],
    template: `
        <app-page-header title="Detalles de movimiento" subtitle="Líneas de productos en movimientos">
            <a routerLink="/admin/detalles-movimiento/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        }

        @if (loading()) {
            <app-loading-spinner />
        } @else if (items().length === 0) {
            <app-empty-state icon="📝" title="Sin detalles" message="No hay líneas de movimiento registradas.">
                <a routerLink="/admin/detalles-movimiento/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Movimiento</th>
                            <th>Producto</th>
                            <th>Lote</th>
                            <th>Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>
                                    <a [routerLink]="['/admin/movimientos', item.movement_id]">{{ item.movement_id }}</a>
                                </td>
                                <td>{{ item.product_name }}</td>
                                <td>{{ item.batch_code || '—' }}</td>
                                <td>{{ item.quantity }}</td>
                                <td class="actions">
                                    <a [routerLink]="['/admin/detalles-movimiento', item.id]" class="btn-sm btn-secondary">Ver</a>
                                    <a [routerLink]="['/admin/detalles-movimiento', item.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
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
export class DetailListComponent implements OnInit {
    private readonly movementService = inject(MovementService);
    private readonly detailService = inject(MovementDetailService);
    private readonly confirmDialog = inject(ConfirmDialogService);

    loading = signal(true);
    error = signal('');
    items = signal<MovementDetail[]>([]);

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.movementService.getAll().subscribe({
            next: (movements) => {
                if (movements.length === 0) {
                    this.items.set([]);
                    this.loading.set(false);
                    return;
                }
                forkJoin(
                    movements.map((m) => this.detailService.getByMovement(m.id)),
                ).subscribe({
                    next: (arrays) => {
                        this.items.set(arrays.flat());
                        this.loading.set(false);
                    },
                    error: (err) => {
                        this.error.set(extractErrorMessage(err, 'Error al cargar detalles.'));
                        this.loading.set(false);
                    },
                });
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al cargar movimientos.'));
                this.loading.set(false);
            },
        });
    }

    async onDelete(item: MovementDetail): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar detalle',
            message: `¿Eliminar línea #${item.id}?`,
            danger: true,
            confirmLabel: 'Eliminar',
        });
        if (!confirmed) return;

        this.detailService.delete(item.id).subscribe({
            next: () => this.load(),
            error: (err) => this.error.set(extractErrorMessage(err, 'Error al eliminar.')),
        });
    }
}
