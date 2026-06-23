import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProductBatchService } from '../../../core/services/product-batch.service';
import { ProductBatch } from '../../../core/models/product-batch.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-batch-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header title="Detalle de lote">
            <a [routerLink]="['/admin/lotes', id, 'editar']" class="btn">Editar</a>
            <a routerLink="/admin/lotes" class="btn btn-secondary">Volver</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        } @else if (item(); as b) {
            <div class="glass-card">
                <div class="detail-row"><span class="label">ID</span><span>{{ b.id }}</span></div>
                <div class="detail-row"><span class="label">Código</span><span>{{ b.batch_code }}</span></div>
                <div class="detail-row">
                    <span class="label">Producto</span>
                    <a [routerLink]="['/admin/productos', b.product.id]">{{ b.product.name }}</a>
                </div>
                <div class="detail-row">
                    <span class="label">Vencimiento</span>
                    <span>{{ b.expiration_date | date: 'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row"><span class="label">Cantidad inicial</span><span>{{ b.initial_quantity }}</span></div>
                <div class="detail-row"><span class="label">Cantidad actual</span><span>{{ b.current_quantity }}</span></div>
                <div class="detail-row"><span class="label">Creado</span><span>{{ b.created_at | date: 'dd/MM/yyyy HH:mm' }}</span></div>
            </div>
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
    `,
})
export class BatchDetailComponent implements OnInit {
    private readonly service = inject(ProductBatchService);
    private readonly route = inject(ActivatedRoute);

    id = Number(this.route.snapshot.paramMap.get('id'));
    loading = signal(true);
    error = signal('');
    item = signal<ProductBatch | null>(null);

    ngOnInit(): void {
        this.service.getById(this.id).subscribe({
            next: (b) => {
                this.item.set(b);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'No se pudo cargar el lote.'));
                this.loading.set(false);
            },
        });
    }
}
