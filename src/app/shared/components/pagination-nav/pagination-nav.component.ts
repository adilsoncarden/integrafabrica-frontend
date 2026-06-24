import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-pagination-nav',
    standalone: true,
    template: `
        <nav
            aria-label="Page navigation"
            class="pagination-nav d-flex justify-content-between align-items-center mt-3"
        >
            <small class="text-muted">{{ rangeLabel() }}</small>
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item" [class.disabled]="currentPage() === 0">
                    <button
                        type="button"
                        class="page-link"
                        [disabled]="currentPage() === 0"
                        (click)="onPageChange(currentPage() - 1)"
                    >
                        Anterior
                    </button>
                </li>
                <li class="page-item" [class.disabled]="isLastPage()">
                    <button
                        type="button"
                        class="page-link"
                        [disabled]="isLastPage()"
                        (click)="onPageChange(currentPage() + 1)"
                    >
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    `,
    styles: `
        .pagination-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .text-muted {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
        }
        .pagination {
            display: flex;
            list-style: none;
            padding: 0;
            margin: 0;
            gap: 0.25rem;
        }
        .page-item.disabled .page-link {
            opacity: 0.45;
            cursor: not-allowed;
            pointer-events: none;
        }
        .page-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 5.5rem;
            padding: 0.375rem 0.75rem;
            border: 1px solid var(--color-border-input);
            border-radius: var(--radius-md);
            background: var(--color-surface);
            color: var(--color-text-primary);
            font-size: var(--font-size-sm);
            font-weight: 600;
            font-family: var(--font-family);
            cursor: pointer;
            transition:
                background 0.2s ease,
                border-color 0.2s ease,
                color 0.2s ease;
        }
        .page-link:hover:not(:disabled) {
            background: rgba(79, 70, 229, 0.08);
            border-color: var(--color-primary);
            color: var(--color-primary);
        }
        .page-link:disabled {
            cursor: not-allowed;
        }
    `,
})
export class PaginationNavComponent {
    currentPage = input.required<number>();
    pageSize = input.required<number>();
    totalElements = input.required<number>();

    pageChange = output<number>();

    rangeLabel(): string {
        const total = this.totalElements();
        if (total === 0) {
            return 'Sin registros';
        }
        const page = this.currentPage();
        const size = this.pageSize();
        const from = page * size + 1;
        const to = Math.min((page + 1) * size, total);
        return `Mostrando registros del ${from} al ${to} de ${total}`;
    }

    isLastPage(): boolean {
        return (this.currentPage() + 1) * this.pageSize() >= this.totalElements();
    }

    onPageChange(page: number): void {
        if (page < 0 || this.isLastPage() && page > this.currentPage()) {
            return;
        }
        this.pageChange.emit(page);
    }
}
