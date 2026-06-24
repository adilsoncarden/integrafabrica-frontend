import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MovementService } from '../../../core/services/movement.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast.service';
import { Movement, MovementType } from '../../../core/models/movement.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationNavComponent } from '../../../shared/components/pagination-nav/pagination-nav.component';
import { extractErrorMessage, shouldSuppressErrorToast } from '../../../core/utils/error.util';
import { setupAuthGuardedInitialLoad } from '../../../core/utils/auth-ready.util';

type FilterTab = 'ALL' | MovementType;

@Component({
    selector: 'app-movement-list',
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
        <app-page-header title="Movimientos" subtitle="Entradas, salidas y mermas">
            <a routerLink="/admin/movimientos/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        <div class="filter-tabs">
            @for (tab of tabs; track tab.value) {
                <button
                    type="button"
                    class="tab-btn"
                    [class.active]="activeTab() === tab.value"
                    (click)="setTab(tab.value)"
                >
                    {{ tab.label }}
                </button>
            }
        </div>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (totalElements() === 0) {
            <app-empty-state icon="🔄" title="Sin movimientos" message="No hay movimientos para este filtro.">
                <a routerLink="/admin/movimientos/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Motivo</th>
                            <th>Proveedor</th>
                            <th>Realizado por</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>
                                    <span class="badge" [class]="typeBadge(item.movement_type)">{{
                                        item.movement_type
                                    }}</span>
                                </td>
                                <td>{{ item.reason }}</td>
                                <td>{{ item.supplier?.company_name || '—' }}</td>
                                <td>{{ item.performed_by_user }}</td>
                                <td>{{ item.created_at | date: 'dd/MM/yyyy HH:mm' }}</td>
                                <td class="actions">
                                    <a [routerLink]="['/admin/movimientos', item.id]" class="btn-sm btn-secondary">Ver</a>
                                    <a [routerLink]="['/admin/movimientos', item.id, 'editar']" class="btn-sm btn-secondary">Editar</a>
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
    styles: `
        .filter-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        .tab-btn {
            background: transparent;
            border: 1px solid var(--color-border-input);
            color: var(--color-text-secondary);
            padding: 0.5rem 1rem;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: 600;
            font-size: var(--font-size-sm);
        }
        .tab-btn.active {
            background: rgba(30, 64, 175, 0.2);
            border-color: var(--color-accent);
            color: var(--color-text-primary);
        }
        .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    `,
})
export class MovementListComponent {
    private readonly service = inject(MovementService);
    private readonly authService = inject(AuthService);
    private readonly confirmDialog = inject(ConfirmDialogService);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    activeTab = signal<FilterTab>('ALL');
    items = signal<Movement[]>([]);
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);

    tabs: { value: FilterTab; label: string }[] = [
        { value: 'ALL', label: 'Todos' },
        { value: 'ENTRADA', label: 'Entrada' },
        { value: 'SALIDA', label: 'Salida' },
        { value: 'MERMA', label: 'Merma' },
    ];

    constructor() {
        setupAuthGuardedInitialLoad(() => this.load());
    }

    setTab(tab: FilterTab): void {
        this.activeTab.set(tab);
        this.currentPage.set(0);
        this.load();
    }

    load(): void {
        this.loading.set(true);

        const tab = this.activeTab();
        const request =
            tab === 'ALL'
                ? this.service.getPage(this.currentPage(), this.pageSize())
                : this.service.getByTypePage(tab, this.currentPage(), this.pageSize());

        request.subscribe({
            next: (page) => {
                this.items.set(page.content);
                this.totalElements.set(page.totalElements);
                this.loading.set(false);
            },
            error: (err) => {
                if (!shouldSuppressErrorToast(err, this.authService)) {
                    this.toast.error(extractErrorMessage(err, 'Error al cargar movimientos.'));
                }
                this.loading.set(false);
            },
        });
    }

    changePage(page: number): void {
        this.currentPage.set(page);
        this.load();
    }

    typeBadge(type: string): string {
        switch (type) {
            case 'ENTRADA':
                return 'badge primary';
            case 'SALIDA':
                return 'badge success';
            case 'MERMA':
                return 'badge danger';
            default:
                return 'badge neutral';
        }
    }

    async onDelete(item: Movement): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Eliminar movimiento',
            message: `¿Eliminar movimiento #${item.id}?`,
            danger: true,
            confirmLabel: 'Eliminar',
        });
        if (!confirmed) return;

        this.service.delete(item.id).subscribe({
            next: () => {
                this.toast.success(`Movimiento #${item.id} eliminado.`);
                this.load();
            },
            error: (err) => this.toast.error(extractErrorMessage(err, 'Error al eliminar.')),
        });
    }
}
