import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { forkJoin } from "rxjs";
import { ProductBatchService } from "../../../core/services/product-batch.service";
import { ProductService } from "../../../core/services/product.service";
import { ToastService } from "../../../core/services/toast.service";
import { Product } from "../../../core/models/product.model";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { extractErrorMessage } from "../../../core/utils/error.util";

@Component({
    selector: "app-batch-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
    ],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar lote' : 'Nuevo lote'"
            [subtitle]="
                isEdit
                    ? 'Modifica los datos del lote'
                    : 'Registra un nuevo lote'
            "
        />

        @if (loading()) {
            <app-loading-spinner />
        } @else {
            <form class="glass-card" [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="batch_code">Código de lote *</label>
                        <input
                            id="batch_code"
                            type="text"
                            formControlName="batch_code"
                            maxlength="100"
                        />
                    </div>
                    <div class="form-group">
                        <label for="product_id">Producto *</label>
                        <select id="product_id" formControlName="product_id">
                            <option [ngValue]="null" disabled>
                                Seleccionar...
                            </option>
                            @for (p of products(); track p.id) {
                                <option [ngValue]="p.id">
                                    {{ p.name }} ({{ p.sku }})
                                </option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="expiration_date"
                            >Fecha de vencimiento *</label
                        >
                        <input
                            id="expiration_date"
                            type="date"
                            formControlName="expiration_date"
                        />
                    </div>
                    <div class="form-group">
                        <label for="initial_quantity">Cantidad inicial *</label>
                        <input
                            id="initial_quantity"
                            type="number"
                            formControlName="initial_quantity"
                            min="0"
                        />
                    </div>
                    <div class="form-group">
                        <label for="current_quantity">Cantidad actual *</label>
                        <input
                            id="current_quantity"
                            type="number"
                            formControlName="current_quantity"
                            min="0"
                        />
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/lotes" class="btn btn-secondary"
                        >Cancelar</a
                    >
                    <button
                        type="submit"
                        class="btn"
                        [disabled]="form.invalid || saving()"
                    >
                        {{
                            saving()
                                ? "Guardando..."
                                : isEdit
                                  ? "Actualizar"
                                  : "Crear"
                        }}
                    </button>
                </div>
            </form>
        }
    `,
    styles: `
        .form-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
    `,
})
export class BatchFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly batchService = inject(ProductBatchService);
    private readonly productService = inject(ProductService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    isEdit = false;
    editId: number | null = null;
    loading = signal(true);
    saving = signal(false);
    products = signal<Product[]>([]);

    form = this.fb.group({
        product_id: [null as number | null, Validators.required],
        batch_code: ["", [Validators.required, Validators.maxLength(100)]],
        expiration_date: ["", Validators.required],
        initial_quantity: [0, [Validators.required, Validators.min(0)]],
        current_quantity: [0, [Validators.required, Validators.min(0)]],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get("id");
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
        }

        const loads = [
            this.productService.getAll(),
            ...(this.isEdit && this.editId
                ? [this.batchService.getById(this.editId)]
                : []),
        ];

        forkJoin(loads).subscribe({
            next: (results) => {
                this.products.set(results[0] as Product[]);
                if (this.isEdit && results[1]) {
                    const b =
                        results[1] as import("../../../core/models/product-batch.model").ProductBatch;
                    this.form.patchValue({
                        product_id: b.product.id,
                        batch_code: b.batch_code,
                        expiration_date: b.expiration_date.substring(0, 10),
                        initial_quantity: b.initial_quantity,
                        current_quantity: b.current_quantity,
                    });
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.error(
                    extractErrorMessage(err, "Error al cargar datos."),
                );
                this.loading.set(false);
            },
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        const v = this.form.getRawValue();
        if (v.product_id == null) return;

        this.saving.set(true);
        const request = {
            product_id: v.product_id,
            batch_code: v.batch_code!,
            expiration_date: v.expiration_date!,
            initial_quantity: v.initial_quantity!,
            current_quantity: v.current_quantity!,
        };
        const op =
            this.isEdit && this.editId
                ? this.batchService.update(this.editId, request)
                : this.batchService.create(request);

        op.subscribe({
            next: () => {
                this.toast.success(
                    this.isEdit ? "Lote actualizado." : "Lote creado.",
                );
                this.router.navigate(["/admin/lotes"]);
            },
            error: (err) => {
                this.toast.error(extractErrorMessage(err, "Error al guardar."));
                this.saving.set(false);
            },
        });
    }
}
