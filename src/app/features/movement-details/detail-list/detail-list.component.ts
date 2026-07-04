import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { MovementDetailService } from "../../../core/services/movement-detail.service";
import { ConfirmDialogService } from "../../../core/services/confirm-dialog.service";
import { ToastService } from "../../../core/services/toast.service";
import { MovementDetail } from "../../../core/models/movement-detail.model";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { PaginationNavComponent } from "../../../shared/components/pagination-nav/pagination-nav.component";
import {
    extractErrorMessage,
    shouldSuppressErrorToast,
} from "../../../core/utils/error.util";
import { setupAuthGuardedInitialLoad } from "../../../core/utils/auth-ready.util";

@Component({
    selector: "app-detail-list",
    standalone: true,
    imports: [
        RouterLink,
        PageHeaderComponent,
        LoadingSpinnerComponent,
        EmptyStateComponent,
        PaginationNavComponent,
    ],
    template: `
        <app-page-header
            title="Detalles de movimiento"
            subtitle="Líneas de productos en movimientos"
        >
            <a routerLink="/admin/detalles-movimiento/nuevo" class="btn"
                >+ Nuevo</a
            >
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (totalElements() === 0) {
            <app-empty-state
                icon="📝"
                title="Sin detalles"
                message="No hay líneas de movimiento registradas."
            >
                <a routerLink="/admin/detalles-movimiento/nuevo" class="btn"
                    >+ Nuevo</a
                >
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Movimiento</th>
                            <th>Producto</th>
                            <th>Lote</th>
                            <th>Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>
                                    <a
                                        [routerLink]="[
                                            '/admin/movimientos',
                                            item.movement_id,
                                        ]"
                                        >{{ item.movement_id }}</a
                                    >
                                </td>
                                <td>{{ item.product_name }}</td>
                                <td>{{ item.batch_code || "—" }}</td>
                                <td>{{ item.quantity }}</td>
                                <td class="actions">
                                    <a
                                        [routerLink]="[
                                            '/admin/detalles-movimiento',
                                            item.id,
                                        ]"
                                        class="btn-sm btn-secondary"
                                        >Ver</a
                                    >
                                    <a
                                        [routerLink]="[
                                            '/admin/detalles-movimiento',
                                            item.id,
                                            'editar',
                                        ]"
                                        class="btn-sm btn-secondary"
                                        >Editar</a
                                    >
                                    <button
                                        type="button"
                                        class="btn-sm btn-danger"
                                        (click)="onDelete(item)"
                                    >
                                        Eliminar
                                    </button>
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
        .actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
    `,
})
export class DetailListComponent {
    private readonly authService = inject(AuthService);
    private readonly detailService = inject(MovementDetailService);
    private readonly confirmDialog = inject(ConfirmDialogService);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    items = signal<MovementDetail[]>([]);
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);

    constructor() {
        setupAuthGuardedInitialLoad(() => this.load());
    }

    load(): void {
        this.loading.set(true);
        this.detailService
            .getPage(this.currentPage(), this.pageSize())
            .subscribe({
                next: (page) => {
                    this.items.set(page.content);
                    this.totalElements.set(page.totalElements);
                    this.loading.set(false);
                },
                error: (err) => {
                    if (!shouldSuppressErrorToast(err, this.authService)) {
                        this.toast.error(
                            extractErrorMessage(
                                err,
                                "Error al cargar detalles.",
                            ),
                        );
                    }
                    this.loading.set(false);
                },
            });
    }

    changePage(page: number): void {
        this.currentPage.set(page);
        this.load();
    }

    async onDelete(item: MovementDetail): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: "Eliminar detalle",
            message: `¿Eliminar línea #${item.id}?`,
            danger: true,
            confirmLabel: "Eliminar",
        });
        if (!confirmed) return;

        this.detailService.delete(item.id).subscribe({
            next: () => {
                this.toast.success(`Línea #${item.id} eliminada.`);
                this.load();
            },
            error: (err) =>
                this.toast.error(
                    extractErrorMessage(err, "Error al eliminar."),
                ),
        });
    }
}
