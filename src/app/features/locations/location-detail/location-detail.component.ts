import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LocationService } from '../../../core/services/location.service';
import { Location } from '../../../core/models/location.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-location-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header title="Detalle de ubicación">
            <a [routerLink]="['/admin/ubicaciones', id, 'editar']" class="btn">Editar</a>
            <a routerLink="/admin/ubicaciones" class="btn btn-secondary">Volver</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        } @else if (item(); as loc) {
            <div class="glass-card">
                <div class="detail-row"><span class="label">ID</span><span>{{ loc.id }}</span></div>
                <div class="detail-row"><span class="label">Pasillo</span><span>{{ loc.aisle }}</span></div>
                <div class="detail-row"><span class="label">Estante</span><span>{{ loc.rack }}</span></div>
                <div class="detail-row"><span class="label">Nivel</span><span>{{ loc.level }}</span></div>
                <div class="detail-row"><span class="label">Descripción</span><span>{{ loc.description || '—' }}</span></div>
                <div class="detail-row"><span class="label">Creado</span><span>{{ loc.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span></div>
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
export class LocationDetailComponent implements OnInit {
    private readonly service = inject(LocationService);
    private readonly route = inject(ActivatedRoute);

    id = Number(this.route.snapshot.paramMap.get('id'));
    loading = signal(true);
    error = signal('');
    item = signal<Location | null>(null);

    ngOnInit(): void {
        this.service.getById(this.id).subscribe({
            next: (loc) => {
                this.item.set(loc);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'No se pudo cargar la ubicación.'));
                this.loading.set(false);
            },
        });
    }
}
