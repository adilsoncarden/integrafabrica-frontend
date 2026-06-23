import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { extractErrorMessage } from '../../../core/utils/error.util';

@Component({
    selector: 'app-category-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, PageHeaderComponent, LoadingSpinnerComponent],
    template: `
        <app-page-header title="Detalle de categoría">
            <a [routerLink]="['/admin/categorias', id, 'editar']" class="btn">Editar</a>
            <a routerLink="/admin/categorias" class="btn btn-secondary">Volver</a>
        </app-page-header>

        @if (loading()) {
            <app-loading-spinner />
        } @else if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        } @else if (item(); as cat) {
            <div class="glass-card detail-grid">
                <div class="detail-row"><span class="label">ID</span><span>{{ cat.id }}</span></div>
                <div class="detail-row"><span class="label">Nombre</span><span>{{ cat.name }}</span></div>
                <div class="detail-row"><span class="label">Descripción</span><span>{{ cat.description || '—' }}</span></div>
                <div class="detail-row"><span class="label">Creado</span><span>{{ cat.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span></div>
            </div>
        }
    `,
    styles: `
        .detail-grid .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--color-border);
        }
        .label {
            color: var(--color-text-secondary);
            font-weight: 600;
        }
    `,
})
export class CategoryDetailComponent implements OnInit {
    private readonly service = inject(CategoryService);
    private readonly route = inject(ActivatedRoute);

    id = Number(this.route.snapshot.paramMap.get('id'));
    loading = signal(true);
    error = signal('');
    item = signal<Category | null>(null);

    ngOnInit(): void {
        this.service.getById(this.id).subscribe({
            next: (cat) => {
                this.item.set(cat);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'No se pudo cargar la categoría.'));
                this.loading.set(false);
            },
        });
    }
}
