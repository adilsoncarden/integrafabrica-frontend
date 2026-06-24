import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LocationService } from '../../../core/services/location.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Location } from '../../../core/models/location.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationNavComponent } from '../../../shared/components/pagination-nav/pagination-nav.component';
import { extractErrorMessage, shouldSuppressErrorToast } from '../../../core/utils/error.util';
import { setupAuthGuardedInitialLoad } from '../../../core/utils/auth-ready.util';

@Component({
    selector: 'app-location-list',
    standalone: true,
    imports: [
        RouterLink,
        DatePipe,
        PageHeaderComponent,
        LoadingSpinnerComponent,
        EmptyStateComponent,
        PaginationNavComponent,
    ],
    template: `
        <app-page-header title="Ubicaciones" subtitle="Pasillos, estantes y niveles del almacén">
            <a routerLink="/admin/ubicaciones/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (totalElements() === 0) {
            <app-empty-state icon="📍" title="Sin ubicaciones" message="Registra ubicaciones para asignar productos.">
                <a routerLink="/admin/ubicaciones/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pasillo</th>
                            <th>Estante</th>
                            <th>Nivel</th>
                            <th>Descripción</th>
                            <th>Creado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>{{ item.aisle }}</td>
                                <td>{{ item.rack }}</td>
                                <td>{{ item.level }}</td>
                                <td>{{ item.description || '—' }}</td>
                                <td>{{ item.createdAt | date: 'dd/MM/yyyy' }}</td>
                                <td class="actions">
                                    <a [routerLink]="['/admin/ubicaciones', item.id]" class="btn-sm btn-secondary">Ver</a>
                                    <a [routerLink]="['/admin/ubicaciones', item.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
                                    <button type="button" class="btn-sm btn-danger" (click)="onDelete(item)">Eliminar</button>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
                <app-pagination-nav
                    [currentPage]="currentPage()"
                    [pageSize]="pageSize()"
                    [totalElements]="totalElements()"
                    (pageChange)="changePage($event)"
                />
            </div>
        }
    `,
    styles: `.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }`,
})
export class LocationListComponent {
    private readonly service = inject(LocationService);
    private readonly authService = inject(AuthService);
    private readonly confirmDialog = inject(ConfirmDialogService);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    items = signal<Location[]>([]);
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);

    constructor() {
        setupAuthGuardedInitialLoad(() => this.load());
    }

    load(): void {
        this.loading.set(true);
        this.service.getPage(this.currentPage(), this.pageSize()).subscribe({
            next: (page) => {
                this.items.set(page.content);
                this.totalElements.set(page.totalElements);
                this.loading.set(false);
            },
            error: (err) => {
                if (!shouldSuppressErrorToast(err, this.authService)) {
                    this.toast.error(extractErrorMessage(err, 'Error al cargar ubicaciones.'));
                }
                this.loading.set(false);
            },
        });
    }

    changePage(page: number): void {
        this.currentPage.set(page);
        this.load();
    }

    async onDelete(item: Location): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar ubicación',
            message: `¿Eliminar ubicación ${item.aisle}-${item.rack}-${item.level}?`,
            danger: true,
            confirmLabel: 'Eliminar',
        });
        if (!confirmed) return;

        this.service.delete(item.id).subscribe({
            next: () => {
                this.toast.success(`Ubicación ${item.aisle}-${item.rack}-${item.level} eliminada.`);
                this.load();
            },
            error: (err) => this.toast.error(extractErrorMessage(err, 'Error al eliminar.')),
        });
    }
}
