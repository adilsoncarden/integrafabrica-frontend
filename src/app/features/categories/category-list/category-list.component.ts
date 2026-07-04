import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { CategoryService } from "../../../core/services/category.service";
import { AuthService } from "../../../core/services/auth.service";
import { ConfirmDialogService } from "../../../core/services/confirm-dialog.service";
import { ToastService } from "../../../core/services/toast.service";
import { Category } from "../../../core/models/category.model";
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
    selector: "app-category-list",
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
        <app-page-header
            title="Categorías"
            subtitle="Gestión de categorías de productos"
        >
            <a routerLink="/admin/categorias/nuevo" class="btn">+ Nuevo</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (totalElements() === 0) {
            <app-empty-state
                icon="🏷️"
                title="Sin categorías"
                message="Crea la primera categoría para organizar tus productos."
            >
                <a routerLink="/admin/categorias/nuevo" class="btn">+ Nuevo</a>
            </app-empty-state>
        } @else {
            <div class="glass-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Creado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of items(); track item.id) {
                            <tr>
                                <td>{{ item.id }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.description || "—" }}</td>
                                <td>
                                    {{ item.createdAt | date: "dd/MM/yyyy" }}
                                </td>
                                <td class="actions">
                                    <a
                                        [routerLink]="[
                                            '/admin/categorias',
                                            item.id,
                                        ]"
                                        class="btn-sm btn-secondary"
                                        >Ver</a
                                    >
                                    <a
                                        [routerLink]="[
                                            '/admin/categorias',
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
export class CategoryListComponent {
    private readonly service = inject(CategoryService);
    private readonly authService = inject(AuthService);
    private readonly confirmDialog = inject(ConfirmDialogService);
    private readonly toast = inject(ToastService);

    loading = signal(true);
    items = signal<Category[]>([]);
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
                    this.toast.error(
                        extractErrorMessage(err, "Error al cargar categorías."),
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

    async onDelete(item: Category): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: "Eliminar categoría",
            message: `¿Eliminar la categoría "${item.name}"?`,
            danger: true,
            confirmLabel: "Eliminar",
        });
        if (!confirmed) return;

        this.service.delete(item.id).subscribe({
            next: () => {
                this.toast.success(`Categoría "${item.name}" eliminada.`);
                this.load();
            },
            error: (err) =>
                this.toast.error(
                    extractErrorMessage(err, "Error al eliminar."),
                ),
        });
    }
}
