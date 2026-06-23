import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { LocationService } from '../../../core/services/location.service';
import { Category } from '../../../core/models/category.model';
import { Location } from '../../../core/models/location.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar producto' : 'Nuevo producto'"
            [subtitle]="isEdit ? 'Modifica los datos del producto' : 'Registra un nuevo producto'"
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
                        <label for="sku">SKU *</label>
                        <input id="sku" type="text" formControlName="sku" maxlength="50" />
                    </div>
                    <div class="form-group">
                        <label for="name">Nombre *</label>
                        <input id="name" type="text" formControlName="name" maxlength="150" />
                    </div>
                    <div class="form-group">
                        <label for="categoryId">Categoría *</label>
                        <select id="categoryId" formControlName="categoryId">
                            <option [ngValue]="null" disabled>Seleccionar...</option>
                            @for (c of categories(); track c.id) {
                                <option [ngValue]="c.id">{{ c.name }}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="locationId">Ubicación *</label>
                        <select id="locationId" formControlName="locationId">
                            <option [ngValue]="null" disabled>Seleccionar...</option>
                            @for (l of locations(); track l.id) {
                                <option [ngValue]="l.id">{{ l.aisle }}-{{ l.rack }}-{{ l.level }}</option>
                            }
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="unit">Unidad *</label>
                        <input id="unit" type="text" formControlName="unit" maxlength="20" />
                    </div>
                    <div class="form-group">
                        <label for="stock">Stock *</label>
                        <input id="stock" type="number" formControlName="stock" min="0" step="0.01" />
                    </div>
                    <div class="form-group">
                        <label for="minStock">Stock mínimo *</label>
                        <input id="minStock" type="number" formControlName="minStock" min="0" step="0.01" />
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/productos" class="btn btn-secondary">Cancelar</a>
                    <button type="submit" class="btn" [disabled]="form.invalid || saving()">
                        {{ saving() ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        }
    `,
    styles: `.form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }`,
})
export class ProductFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly productService = inject(ProductService);
    private readonly categoryService = inject(CategoryService);
    private readonly locationService = inject(LocationService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    isEdit = false;
    editId: number | null = null;
    loading = signal(true);
    saving = signal(false);
    error = signal('');
    categories = signal<Category[]>([]);
    locations = signal<Location[]>([]);

    form = this.fb.group({
        sku: ['', [Validators.required, Validators.maxLength(50)]],
        name: ['', [Validators.required, Validators.maxLength(150)]],
        categoryId: [null as number | null, Validators.required],
        locationId: [null as number | null, Validators.required],
        unit: ['', [Validators.required, Validators.maxLength(20)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        minStock: [0, [Validators.required, Validators.min(0)]],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
        }

        const loads = [
            this.categoryService.getAll(),
            this.locationService.getAll(),
            ...(this.isEdit && this.editId
                ? [this.productService.getById(this.editId)]
                : []),
        ];

        forkJoin(loads).subscribe({
            next: (results) => {
                this.categories.set(results[0] as Category[]);
                this.locations.set(results[1] as Location[]);
                if (this.isEdit && results[2]) {
                    const p = results[2] as import('../../../core/models/product.model').Product;
                    this.form.patchValue({
                        sku: p.sku,
                        name: p.name,
                        categoryId: p.category.id,
                        locationId: p.location.id,
                        unit: p.unit,
                        stock: p.stock,
                        minStock: p.minStock,
                    });
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
        if (v.categoryId == null || v.locationId == null) return;

        this.saving.set(true);
        this.error.set('');
        const request = {
            sku: v.sku!,
            name: v.name!,
            categoryId: v.categoryId,
            locationId: v.locationId,
            unit: v.unit!,
            stock: v.stock!,
            minStock: v.minStock!,
        };
        const op =
            this.isEdit && this.editId
                ? this.productService.update(this.editId, request)
                : this.productService.create(request);

        op.subscribe({
            next: () => this.router.navigate(['/admin/productos']),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al guardar.'));
                this.saving.set(false);
            },
        });
    }
}
