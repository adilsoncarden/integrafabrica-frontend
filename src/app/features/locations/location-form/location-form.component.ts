import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { LocationService } from "../../../core/services/location.service";
import { ToastService } from "../../../core/services/toast.service";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { extractErrorMessage } from "../../../core/utils/error.util";

@Component({
    selector: "app-location-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
    ],
    template: `
        <app-page-header
            [title]="isEdit ? 'Editar ubicación' : 'Nueva ubicación'"
            [subtitle]="
                isEdit
                    ? 'Modifica los datos de la ubicación'
                    : 'Registra una nueva ubicación'
            "
        />

        @if (loading()) {
            <app-loading-spinner />
        } @else {
            <form class="glass-card" [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="aisle">Pasillo *</label>
                        <input
                            id="aisle"
                            type="text"
                            formControlName="aisle"
                            maxlength="50"
                        />
                    </div>
                    <div class="form-group">
                        <label for="rack">Estante *</label>
                        <input
                            id="rack"
                            type="text"
                            formControlName="rack"
                            maxlength="50"
                        />
                    </div>
                    <div class="form-group">
                        <label for="level">Nivel *</label>
                        <input
                            id="level"
                            type="text"
                            formControlName="level"
                            maxlength="50"
                        />
                    </div>
                    <div class="form-group full-width">
                        <label for="description">Descripción</label>
                        <textarea
                            id="description"
                            formControlName="description"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div class="form-actions">
                    <a routerLink="/admin/ubicaciones" class="btn btn-secondary"
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
export class LocationFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly service = inject(LocationService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    isEdit = false;
    editId: number | null = null;
    loading = signal(false);
    saving = signal(false);

    form = this.fb.nonNullable.group({
        aisle: ["", [Validators.required, Validators.maxLength(50)]],
        rack: ["", [Validators.required, Validators.maxLength(50)]],
        level: ["", [Validators.required, Validators.maxLength(50)]],
        description: [""],
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get("id");
        if (idParam) {
            this.isEdit = true;
            this.editId = Number(idParam);
            this.loading.set(true);
            this.service.getById(this.editId).subscribe({
                next: (loc) => {
                    this.form.patchValue({
                        aisle: loc.aisle,
                        rack: loc.rack,
                        level: loc.level,
                        description: loc.description ?? "",
                    });
                    this.loading.set(false);
                },
                error: (err) => {
                    this.toast.error(
                        extractErrorMessage(
                            err,
                            "No se pudo cargar la ubicación.",
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
        const request = {
            aisle: this.form.controls.aisle.value,
            rack: this.form.controls.rack.value,
            level: this.form.controls.level.value,
            description: this.form.controls.description.value || null,
        };
        const op =
            this.isEdit && this.editId
                ? this.service.update(this.editId, request)
                : this.service.create(request);

        op.subscribe({
            next: () => {
                this.toast.success(
                    this.isEdit
                        ? "Ubicación actualizada."
                        : "Ubicación creada.",
                );
                this.router.navigate(["/admin/ubicaciones"]);
            },
            error: (err) => {
                this.toast.error(extractErrorMessage(err, "Error al guardar."));
                this.saving.set(false);
            },
        });
    }
}
