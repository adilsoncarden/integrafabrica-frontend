import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-supplier-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header title="Detalle de proveedor">
            <a [routerLink]="['/admin/proveedores', id, 'editar']" class="btn">Editar</a>
            <a routerLink="/admin/proveedores" class="btn btn-secondary">Volver</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        } @else if (item(); as s) {
            <div class="glass-card">
                <div class="detail-row"><span class="label">ID</span><span>{{ s.id }}</span></div>
                <div class="detail-row"><span class="label">RUC</span><span>{{ s.ruc }}</span></div>
                <div class="detail-row"><span class="label">Razón social</span><span>{{ s.company_name }}</span></div>
                <div class="detail-row"><span class="label">Contacto</span><span>{{ s.contact_name || '—' }}</span></div>
                <div class="detail-row"><span class="label">Teléfono</span><span>{{ s.phone || '—' }}</span></div>
                <div class="detail-row"><span class="label">Email</span><span>{{ s.email || '—' }}</span></div>
                <div class="detail-row"><span class="label">Tiempo de entrega</span><span>{{ s.delivery_time_days }} días</span></div>
                <div class="detail-row"><span class="label">Creado</span><span>{{ s.created_at | date: 'dd/MM/yyyy HH:mm' }}</span></div>
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
export class SupplierDetailComponent implements OnInit {
    private readonly service = inject(SupplierService);
    private readonly route = inject(ActivatedRoute);

    id = Number(this.route.snapshot.paramMap.get('id'));
    loading = signal(true);
    error = signal('');
    item = signal<Supplier | null>(null);

    ngOnInit(): void {
        this.service.getById(this.id).subscribe({
            next: (s) => {
                this.item.set(s);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'No se pudo cargar el proveedor.'));
                this.loading.set(false);
            },
        });
    }
}
