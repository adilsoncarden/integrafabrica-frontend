import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { MovementDetailService } from "../../../core/services/movement-detail.service";
import { ToastService } from "../../../core/services/toast.service";
import { MovementDetail } from "../../../core/models/movement-detail.model";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { extractErrorMessage } from "../../../core/utils/error.util";

@Component({
    selector: "app-detail-detail",
    standalone: true,
    imports: [RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header title="Detalle de línea">
            <a
                [routerLink]="['/admin/detalles-movimiento', id, 'editar']"
                class="btn"
                >Editar</a
            >
            <a routerLink="/admin/detalles-movimiento" class="btn btn-secondary"
                >Volver</a
            >
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (item(); as d) {
            <div class="glass-card">
                <div class="detail-row">
                    <span class="label">ID</span><span>{{ d.id }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Movimiento</span>
                    <a [routerLink]="['/admin/movimientos', d.movement_id]"
                        >#{{ d.movement_id }}</a
                    >
                </div>
                <div class="detail-row">
                    <span class="label">Producto</span
                    ><span>{{ d.product_name }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Producto ID</span>
                    <a [routerLink]="['/admin/productos', d.product_id]">{{
                        d.product_id
                    }}</a>
                </div>
                <div class="detail-row">
                    <span class="label">Lote</span>
                    <span>
                        @if (d.batch_id) {
                            <a [routerLink]="['/admin/lotes', d.batch_id]">{{
                                d.batch_code
                            }}</a>
                        } @else {
                            —
                        }
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Cantidad</span
                    ><span>{{ d.quantity }}</span>
                </div>
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
        .label {
            color: var(--color-text-secondary);
            font-weight: 600;
        }
    `,
})
export class DetailDetailComponent implements OnInit {
    private readonly service = inject(MovementDetailService);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);

    id = Number(this.route.snapshot.paramMap.get("id"));
    loading = signal(true);
    item = signal<MovementDetail | null>(null);

    ngOnInit(): void {
        this.service.getById(this.id).subscribe({
            next: (d) => {
                this.item.set(d);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error(
                    extractErrorMessage(err, "No se pudo cargar el detalle."),
                );
                this.loading.set(false);
            },
        });
    }
}
