import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MovementDetailService } from '../../../core/services/movement-detail.service';
import { MovementService } from '../../../core/services/movement.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductBatchService } from '../../../core/services/product-batch.service';
import { Movement } from '../../../core/models/movement.model';
import { Product } from '../../../core/models/product.model';
import { ProductBatch } from '../../../core/models/product-batch.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-detail-form',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar detalle' : 'Nuevo detalle'"
            [subtitle]="isEdit ? 'Modifica la línea de movimiento' : 'Agrega una línea al movimiento'"
        />

        @if (loading()) {
            <app-loading-spinner />
        } @else {
            @if (error()) {
                <div class="alert alert-error">{{ error() }}</div>
            }

            <form class="glass-card" [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="movement_id">Movimiento *</label>
                        <select id="movement_id" formControlName="movement_id">
                            <option [ngValue]="null" disabled>Seleccionar...</option>
                            @for (m of movements(); track m.id) {
                                <option [ngValue]="m.id">#{{ m.id }} — {{ m.movement_type }} — {{ m.reason }}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product_id">Producto *</label>
                        <select id="product_id" formControlName="product_id">
                            <option [ngValue]="null" disabled>Seleccionar...</option>
                            @for (p of products(); track p.id) {
                                <option [ngValue]="p.id">{{ p.name }} ({{ p.sku }})</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="batch_id">Lote (opcional)</label>
                        <select id="batch_id" formControlName="batch_id">
                            <option [ngValue]="null">Sin lote</option>
                            @for (b of batches(); track b.id) {
                                <option [ngValue]="b.id">{{ b.batch_code }}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quantity">Cantidad *</label>
                        <input id="quantity" type="number" formControlName="quantity" min="1" />
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/detalles-movimiento" class="btn btn-secondary">Cancelar</a>
                    <button type="submit" class="btn" [disabled]="form.invalid || saving()">
                        {{ saving() ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        }
    `,
    styles: `.form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }`,
})
export class DetailFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly detailService = inject(MovementDetailService);
    private readonly movementService = inject(MovementService);
    private readonly productService = inject(ProductService);
    private readonly batchService = inject(ProductBatchService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    isEdit = false;
    editId: number | null = null;
    loading = signal(true);
    saving = signal(false);
    error = signal('');
    movements = signal<Movement[]>([]);
    products = signal<Product[]>([]);
    batches = signal<ProductBatch[]>([]);

    form = this.fb.group({
        movement_id: [null as number | null, Validators.required],
        product_id: [null as number | null, Validators.required],
        batch_id: [null as number | null],
        quantity: [1, [Validators.required, Validators.min(1)]],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
        }

        const movementIdQuery = this.route.snapshot.queryParamMap.get('movement_id');
        if (movementIdQuery && !this.isEdit) {
            this.form.patchValue({ movement_id: Number(movementIdQuery) });
        }

        this.form.controls.product_id.valueChanges.subscribe((productId) => {
            this.form.controls.batch_id.setValue(null);
            if (productId) {
                this.batchService.getByProduct(productId).subscribe({
                    next: (b) => this.batches.set(b),
                    error: () => this.batches.set([]),
                });
            } else {
                this.batches.set([]);
            }
        });

        const loads = [
            this.movementService.getAll(),
            this.productService.getAll(),
            ...(this.isEdit && this.editId ? [this.detailService.getById(this.editId)] : []),
        ];

        forkJoin(loads).subscribe({
            next: (results) => {
                this.movements.set(results[0] as Movement[]);
                this.products.set(results[1] as Product[]);
                if (this.isEdit && results[2]) {
                    const d = results[2] as import('../../../core/models/movement-detail.model').MovementDetail;
                    this.form.patchValue({
                        movement_id: d.movement_id,
                        product_id: d.product_id,
                        batch_id: d.batch_id,
                        quantity: d.quantity,
                    });
                    if (d.product_id) {
                        this.batchService.getByProduct(d.product_id).subscribe({
                            next: (b) => this.batches.set(b),
                        });
                    }
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al cargar datos.'));
                this.loading.set(false);
            },
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        const v = this.form.getRawValue();
        if (v.movement_id == null || v.product_id == null) return;

        this.saving.set(true);
        this.error.set('');
        const request = {
            movement_id: v.movement_id,
            product_id: v.product_id,
            batch_id: v.batch_id,
            quantity: v.quantity!,
        };
        const op =
            this.isEdit && this.editId
                ? this.detailService.update(this.editId, request)
                : this.detailService.create(request);

        op.subscribe({
            next: () => this.router.navigate(['/admin/detalles-movimiento']),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al guardar.'));
                this.saving.set(false);
            },
        });
    }
}
