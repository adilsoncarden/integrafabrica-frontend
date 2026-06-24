import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MovementService } from '../../../core/services/movement.service';
import { MovementDetailService } from '../../../core/services/movement-detail.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Movement } from '../../../core/models/movement.model';
import { MovementDetail } from '../../../core/models/movement-detail.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-movement-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header title="Detalle de movimiento">
            <a [routerLink]="['/admin/movimientos', id, 'editar']" class="btn">Editar</a>
            <a routerLink="/admin/movimientos" class="btn btn-secondary">Volver</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (item(); as m) {
            <div class="glass-card">
                <div class="detail-row"><span class="label">ID</span><span>{{ m.id }}</span></div>
                <div class="detail-row">
                    <span class="label">Tipo</span>
                    <span class="badge" [class]="typeBadge(m.movement_type)">{{ m.movement_type }}</span>
                </div>
                <div class="detail-row"><span class="label">Motivo</span><span>{{ m.reason }}</span></div>
                <div class="detail-row">
                    <span class="label">Proveedor</span>
                    <span>
                        @if (m.supplier) {
                            <a [routerLink]="['/admin/proveedores', m.supplier.id]">{{ m.supplier.company_name }}</a>
                        } @else {
                            —
                        }
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Doc. referencia</span>
                    <span>{{ m.reference_document_type || '—' }} {{ m.reference_document_number || '' }}</span>
                </div>
                <div class="detail-row"><span class="label">Realizado por</span><span>{{ m.performed_by_user }}</span></div>
                <div class="detail-row"><span class="label">Fecha</span><span>{{ m.created_at | date: 'dd/MM/yyyy HH:mm' }}</span></div>
            </div>

            <section class="glass-card details-section">
                <div class="section-header">
                    <h2>Líneas de detalle</h2>
                    <a [routerLink]="['/admin/detalles-movimiento/nuevo']" [queryParams]="{ movement_id: id }" class="btn btn-sm">+ Agregar línea</a>
                </div>

                @if (detailsLoading()) {
                    <app-loading-spinner />
                } @else if (details().length === 0) {
                    <p class="muted">Sin líneas de detalle.</p>
                } @else {
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Lote</th>
                                <th>Cantidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (d of details(); track d.id) {
                                <tr>
                                    <td>{{ d.id }}</td>
                                    <td>{{ d.product_name }}</td>
                                    <td>{{ d.batch_code || '—' }}</td>
                                    <td>{{ d.quantity }}</td>
                                    <td class="actions">
                                        <a [routerLink]="['/admin/detalles-movimiento', d.id]" class="btn-sm btn-secondary">Ver</a>
                                        <a [routerLink]="['/admin/detalles-movimiento', d.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
                                        <button type="button" class="btn-sm btn-danger" (click)="onDeleteDetail(d)">Eliminar</button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                }
            </section>
        }
    `,
    styles: `
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--color-border);
        }
        .label { color: var(--color-text-secondary); font-weight: 600; }
        .details-section { margin-top: 1.5rem; }
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        h2 { margin: 0; font-size: var(--font-size-lg); }
        .muted { color: var(--color-text-secondary); }
        .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    `,
})
export class MovementDetailComponent implements OnInit {
    private readonly movementService = inject(MovementService);
    private readonly detailService = inject(MovementDetailService);
    private readonly confirmDialog = inject(ConfirmDialogService);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);

    id = Number(this.route.snapshot.paramMap.get('id'));
    loading = signal(true);
    detailsLoading = signal(true);
    item = signal<Movement | null>(null);
    details = signal<MovementDetail[]>([]);

    ngOnInit(): void {
        this.movementService.getById(this.id).subscribe({
            next: (m) => {
                this.item.set(m);
                this.loading.set(false);
                this.loadDetails();
            },
            error: (err) => {
                this.toast.error(extractErrorMessage(err, 'No se pudo cargar el movimiento.'));
                this.loading.set(false);
            },
        });
    }

    loadDetails(): void {
        this.detailsLoading.set(true);
        this.detailService.getByMovement(this.id).subscribe({
            next: (items) => {
                this.details.set(items);
                this.detailsLoading.set(false);
            },
            error: (err) => {
                this.toast.error(extractErrorMessage(err, 'Error al cargar detalles.'));
                this.detailsLoading.set(false);
            },
        });
    }

    typeBadge(type: string): string {
        switch (type) {
            case 'ENTRADA':
                return 'badge primary';
            case 'SALIDA':
                return 'badge success';
            case 'MERMA':
                return 'badge danger';
            default:
                return 'badge neutral';
        }
    }

    async onDeleteDetail(d: MovementDetail): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar línea',
            message: `¿Eliminar línea #${d.id}?`,
            danger: true,
            confirmLabel: 'Eliminar',
        });
        if (!confirmed) return;

        this.detailService.delete(d.id).subscribe({
            next: () => {
                this.toast.success(`Línea #${d.id} eliminada.`);
                this.loadDetails();
            },
            error: (err) => this.toast.error(extractErrorMessage(err, 'Error al eliminar.')),
        });
    }
}
