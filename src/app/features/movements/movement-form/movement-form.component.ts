import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MovementService } from '../../../core/services/movement.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';
import { MovementType } from '../../../core/models/movement.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-movement-form',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar movimiento' : 'Nuevo movimiento'"
            [subtitle]="isEdit ? 'Modifica el movimiento' : 'Registra un nuevo movimiento'"
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
                        <label for="movement_type">Tipo *</label>
                        <select id="movement_type" formControlName="movement_type">
                            <option value="ENTRADA">ENTRADA</option>
                            <option value="SALIDA">SALIDA</option>
                            <option value="MERMA">MERMA</option>
                        </select>
                    </div>
                    @if (showSupplier()) {
                        <div class="form-group">
                            <label for="supplier_id">Proveedor</label>
                            <select id="supplier_id" formControlName="supplier_id">
                                <option [ngValue]="null">Sin proveedor</option>
                                @for (s of suppliers(); track s.id) {
                                    <option [ngValue]="s.id">{{ s.company_name }}</option>
                                }
                            </select>
                        </div>
                    }
                    <div class="form-group full-width">
                        <label for="reason">Motivo *</label>
                        <textarea id="reason" formControlName="reason" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="reference_document_type">Tipo documento ref.</label>
                        <input id="reference_document_type" type="text" formControlName="reference_document_type" />
                    </div>
                    <div class="form-group">
                        <label for="reference_document_number">Número documento ref.</label>
                        <input id="reference_document_number" type="text" formControlName="reference_document_number" />
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/movimientos" class="btn btn-secondary">Cancelar</a>
                    <button type="submit" class="btn" [disabled]="form.invalid || saving()">
                        {{ saving() ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        }
    `,
    styles: `.form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }`,
})
export class MovementFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly movementService = inject(MovementService);
    private readonly supplierService = inject(SupplierService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    isEdit = false;
    editId: number | null = null;
    loading = signal(true);
    saving = signal(false);
    error = signal('');
    suppliers = signal<Supplier[]>([]);
    showSupplier = signal(true);

    form = this.fb.group({
        movement_type: ['ENTRADA' as MovementType, Validators.required],
        reason: ['', Validators.required],
        supplier_id: [null as number | null],
        reference_document_type: [''],
        reference_document_number: [''],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
        }

        this.form.controls.movement_type.valueChanges.subscribe((type) => {
            this.showSupplier.set(type === 'ENTRADA');
            if (type !== 'ENTRADA') {
                this.form.controls.supplier_id.setValue(null);
            }
        });

        const loads = [
            this.supplierService.getAll(),
            ...(this.isEdit && this.editId ? [this.movementService.getById(this.editId)] : []),
        ];

        forkJoin(loads).subscribe({
            next: (results) => {
                this.suppliers.set(results[0] as Supplier[]);
                if (this.isEdit && results[1]) {
                    const m = results[1] as import('../../../core/models/movement.model').Movement;
                    this.form.patchValue({
                        movement_type: m.movement_type.toUpperCase() as MovementType,
                        reason: m.reason,
                        supplier_id: m.supplier?.id ?? null,
                        reference_document_type: m.reference_document_type ?? '',
                        reference_document_number: m.reference_document_number ?? '',
                    });
                    this.showSupplier.set(m.movement_type === 'ENTRADA');
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
        this.saving.set(true);
        this.error.set('');

        const request = {
            movement_type: v.movement_type!,
            reason: v.reason!,
            supplier_id: v.movement_type === 'ENTRADA' ? v.supplier_id : null,
            reference_document_type: v.reference_document_type || null,
            reference_document_number: v.reference_document_number || null,
        };

        const op =
            this.isEdit && this.editId
                ? this.movementService.update(this.editId, request)
                : this.movementService.create(request);

        op.subscribe({
            next: () => this.router.navigate(['/admin/movimientos']),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al guardar.'));
                this.saving.set(false);
            },
        });
    }
}
