import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { ProductService } from "../../../core/services/product.service";
import { ToastService } from "../../../core/services/toast.service";
import { Product } from "../../../core/models/product.model";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { extractErrorMessage } from "../../../core/utils/error.util";

@Component({
    selector: "app-product-detail",
    standalone: true,
    imports: [
        RouterLink,
        DatePipe,
        PageHeaderComponent,
        LoadingSpinnerComponent,
    ],
    template: `
        <app-page-header title="Detalle de producto">
            <a [routerLink]="['/admin/productos', id, 'editar']" class="btn"
                >Editar</a
            >
            <a routerLink="/admin/productos" class="btn btn-secondary"
                >Volver</a
            >
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (item(); as p) {
            <div class="glass-card">
                <div class="detail-row">
                    <span class="label">ID</span><span>{{ p.id }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">SKU</span><span>{{ p.sku }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Nombre</span><span>{{ p.name }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Categoría</span
                    ><span>{{ p.category.name }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Ubicación</span>
                    <span
                        >{{ p.location.aisle }}-{{ p.location.rack }}-{{
                            p.location.level
                        }}</span
                    >
                </div>
                <div class="detail-row">
                    <span class="label">Unidad</span><span>{{ p.unit }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Stock</span>
                    <span>
                        {{ p.stock }}
                        @if (p.stock < p.minStock) {
                            <span class="badge warning">Bajo</span>
                        }
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Stock mínimo</span
                    ><span>{{ p.minStock }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Creado</span
                    ><span>{{ p.createdAt | date: "dd/MM/yyyy HH:mm" }}</span>
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
export class ProductDetailComponent implements OnInit {
    private readonly service = inject(ProductService);
    private readonly route = inject(ActivatedRoute);
    private readonly toast = inject(ToastService);

    id = Number(this.route.snapshot.paramMap.get("id"));
    loading = signal(true);
    item = signal<Product | null>(null);

    ngOnInit(): void {
        this.service.getById(this.id).subscribe({
            next: (p) => {
                this.item.set(p);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error(
                    extractErrorMessage(err, "No se pudo cargar el producto."),
                );
                this.loading.set(false);
            },
        });
    }
}
