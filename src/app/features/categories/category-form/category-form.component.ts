import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar categoría' : 'Nueva categoría'"
            [subtitle]="isEdit ? 'Modifica los datos de la categoría' : 'Registra una nueva categoría'"
        />

        @if (loading()) {
            <app-loading-spinner />
        } @else {
            @if (error()) {
                <div class="alert alert-error">{{ error() }}</div>
            }

            <form class="glass-card" [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="name">Nombre *</label>
                        <input id="name" type="text" formControlName="name" maxlength="100" />
                        @if (form.controls.name.touched && form.controls.name.invalid) {
                            <small class="field-error">El nombre es obligatorio (máx. 100 caracteres).</small>
                        }
                    </div>
                    <div class="form-group full-width">
                        <label for="description">Descripción</label>
                        <textarea id="description" formControlName="description" rows="3"></textarea>
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/categorias" class="btn btn-secondary">Cancelar</a>
                    <button type="submit" class="btn" [disabled]="form.invalid || saving()">
                        {{ saving() ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear' }}
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
        .field-error {
            color: var(--color-error-text);
            font-size: var(--font-size-xs);
        }
    `,
})
export class CategoryFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly service = inject(CategoryService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    isEdit = false;
    editId: number | null = null;
    loading = signal(false);
    saving = signal(false);
    error = signal('');

    form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        description: [''],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
            this.loading.set(true);
            this.service.getById(this.editId).subscribe({
                next: (cat) => {
                    this.form.patchValue({
                        name: cat.name,
                        description: cat.description ?? '',
                    });
                    this.loading.set(false);
                },
                error: (err) => {
                    this.error.set(extractErrorMessage(err, 'No se pudo cargar la categoría.'));
                    this.loading.set(false);
                },
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.saving.set(true);
        this.error.set('');
        const request = {
            name: this.form.controls.name.value,
            description: this.form.controls.description.value || null,
        };
        const op =
            this.isEdit && this.editId
                ? this.service.update(this.editId, request)
                : this.service.create(request);

        op.subscribe({
            next: () => this.router.navigate(['/admin/categorias']),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al guardar.'));
                this.saving.set(false);
            },
        });
    }
}
