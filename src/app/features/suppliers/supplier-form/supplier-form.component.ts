import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { SupplierService } from "../../../core/services/supplier.service";
import { ToastService } from "../../../core/services/toast.service";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { extractErrorMessage } from "../../../core/utils/error.util";

@Component({
    selector: "app-supplier-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
    ],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar proveedor' : 'Nuevo proveedor'"
            [subtitle]="
                isEdit
                    ? 'Modifica los datos del proveedor'
                    : 'Registra un nuevo proveedor'
            "
        />

        @if (loading()) {
            <app-loading-spinner />
        } @else {
            <form class="glass-card" [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="ruc">RUC *</label>
                        <input
                            id="ruc"
                            type="text"
                            formControlName="ruc"
                            maxlength="11"
                        />
                    </div>
                    <div class="form-group">
                        <label for="company_name">Razón social *</label>
                        <input
                            id="company_name"
                            type="text"
                            formControlName="company_name"
                            maxlength="150"
                        />
                    </div>
                    <div class="form-group">
                        <label for="contact_name">Contacto</label>
                        <input
                            id="contact_name"
                            type="text"
                            formControlName="contact_name"
                            maxlength="100"
                        />
                    </div>
                    <div class="form-group">
                        <label for="phone">Teléfono</label>
                        <input id="phone" type="text" formControlName="phone" />
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            formControlName="email"
                            maxlength="100"
                        />
                    </div>
                    <div class="form-group">
                        <label for="delivery_time_days"
                            >Tiempo de entrega (días) *</label
                        >
                        <input
                            id="delivery_time_days"
                            type="number"
                            formControlName="delivery_time_days"
                            min="0"
                        />
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/proveedores" class="btn btn-secondary"
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
export class SupplierFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly service = inject(SupplierService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    isEdit = false;
    editId: number | null = null;
    loading = signal(false);
    saving = signal(false);

    form = this.fb.nonNullable.group({
        ruc: ["", [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
        company_name: ["", [Validators.required, Validators.maxLength(150)]],
        contact_name: ["", Validators.maxLength(100)],
        phone: [""],
        email: ["", [Validators.email, Validators.maxLength(100)]],
        delivery_time_days: [0, [Validators.required, Validators.min(0)]],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get("id");
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
            this.loading.set(true);
            this.service.getById(this.editId).subscribe({
                next: (s) => {
                    this.form.patchValue({
                        ruc: s.ruc,
                        company_name: s.company_name,
                        contact_name: s.contact_name ?? "",
                        phone: s.phone ?? "",
                        email: s.email ?? "",
                        delivery_time_days: s.delivery_time_days,
                    });
                    this.loading.set(false);
                },
                error: (err) => {
                    this.toast.error(
                        extractErrorMessage(
                            err,
                            "No se pudo cargar el proveedor.",
                        ),
                    );
                    this.loading.set(false);
                },
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.saving.set(true);
        const v = this.form.getRawValue();
        const request = {
            ruc: v.ruc,
            company_name: v.company_name,
            contact_name: v.contact_name || "",
            phone: v.phone || undefined,
            email: v.email || undefined,
            delivery_time_days: v.delivery_time_days,
        };
        const op =
            this.isEdit && this.editId
                ? this.service.update(this.editId, request)
                : this.service.create(request);

        op.subscribe({
            next: () => {
                this.toast.success(
                    this.isEdit
                        ? "Proveedor actualizado."
                        : "Proveedor creado.",
                );
                this.router.navigate(["/admin/proveedores"]);
            },
            error: (err) => {
                this.toast.error(extractErrorMessage(err, "Error al guardar."));
                this.saving.set(false);
            },
        });
    }
}
