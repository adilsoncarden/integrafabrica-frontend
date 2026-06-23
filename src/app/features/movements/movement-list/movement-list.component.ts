import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MovementService } from '../../../core/services/movement.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Movement, MovementType } from '../../../core/models/movement.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

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

        @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        }

        @if (loading()) {
            <app-loading-spinner />
        } @else if (filteredItems().length === 0) {
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
                        @for (item of filteredItems(); track item.id) {
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
export class MovementListComponent implements OnInit {
    private readonly service = inject(MovementService);
    private readonly confirmDialog = inject(ConfirmDialogService);

    loading = signal(true);
    error = signal('');
    activeTab = signal<FilterTab>('ALL');
    allItems = this.service.movements;

    tabs: { value: FilterTab; label: string }[] = [
        { value: 'ALL', label: 'Todos' },
        { value: 'ENTRADA', label: 'Entrada' },
        { value: 'SALIDA', label: 'Salida' },
        { value: 'MERMA', label: 'Merma' },
    ];

    filteredItems = computed(() => {
        const tab = this.activeTab();
        const items = this.allItems();
        if (tab === 'ALL') return items;
        return items.filter((m) => m.movement_type === tab);
    });

    ngOnInit(): void {
        this.load();
    }

    setTab(tab: FilterTab): void {
        this.activeTab.set(tab);
        if (tab === 'ALL') {
            this.load();
        } else {
            this.loadByType(tab);
        }
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.service.getAll().subscribe({
            next: () => this.loading.set(false),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al cargar movimientos.'));
                this.loading.set(false);
            },
        });
    }

    loadByType(type: MovementType): void {
        this.loading.set(true);
        this.error.set('');
        this.service.getByType(type).subscribe({
            next: () => this.loading.set(false),
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'Error al filtrar movimientos.'));
                this.loading.set(false);
            },
        });
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
                const tab = this.activeTab();
                tab === 'ALL' ? this.load() : this.loadByType(tab as MovementType);
            },
            error: (err) => this.error.set(extractErrorMessage(err, 'Error al eliminar.')),
        });
    }
}
