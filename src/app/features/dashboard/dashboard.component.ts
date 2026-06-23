import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe, LoadingSpinnerComponent, PageHeaderComponent],
    template: `
        <app-page-header
            title="Dashboard"
            [subtitle]="'Bienvenido, ' + (authService.currentUser()?.username ?? '')"
        />

        @if (loading()) {
            <app-loading-spinner />
        } @else if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
        } @else if (data(); as d) {
            <div class="kpi-grid">
                <div class="glass-card kpi-card">
                    <span class="kpi-icon">📦</span>
                    <div class="kpi-value">{{ d.totalStock | number }}</div>
                    <div class="kpi-label">Stock total (unidades)</div>
                </div>
                <div class="glass-card kpi-card">
                    <span class="kpi-icon">🏷️</span>
                    <div class="kpi-value">{{ d.productCount }}</div>
                    <div class="kpi-label">Productos activos</div>
                </div>
                <div class="glass-card kpi-card">
                    <span class="kpi-icon">📋</span>
                    <div class="kpi-value">{{ d.batchCount }}</div>
                    <div class="kpi-label">Lotes activos</div>
                </div>
                <div class="glass-card kpi-card">
                    <span class="kpi-icon">🔄</span>
                    <div class="kpi-value">{{ d.movementCount }}</div>
                    <div class="kpi-label">Movimientos totales</div>
                </div>
                <div class="glass-card kpi-card">
                    <span class="kpi-icon">📂</span>
                    <div class="kpi-value">{{ d.categoryCount }}</div>
                    <div class="kpi-label">Categorías</div>
                </div>
            </div>

            <div class="dashboard-grid">
                <section class="glass-card">
                    <h2>⚠️ Alertas de stock bajo</h2>
                    @if (d.lowStockProducts.length === 0) {
                        <p class="muted">No hay productos con stock bajo.</p>
                    } @else {
                        <ul class="alert-list">
                            @for (p of d.lowStockProducts; track p.id) {
                                <li>
                                    <a [routerLink]="['/admin/productos', p.id]">{{ p.name }}</a>
                                    — stock {{ p.stock }} / mín. {{ p.minStock }}
                                    <span class="badge warning">Bajo</span>
                                </li>
                            }
                        </ul>
                    }
                </section>

                <section class="glass-card">
                    <h2>⏳ Lotes por vencer (30 días)</h2>
                    @if (d.expiringBatches.length === 0) {
                        <p class="muted">No hay lotes próximos a vencer.</p>
                    } @else {
                        <ul class="alert-list">
                            @for (b of d.expiringBatches; track b.id) {
                                <li>
                                    <a [routerLink]="['/admin/lotes', b.id]">{{ b.batch_code }}</a>
                                    — {{ b.product.name }} — vence
                                    {{ b.expiration_date | date: 'dd/MM/yyyy' }}
                                </li>
                            }
                        </ul>
                    }
                </section>
            </div>

            <section class="glass-card">
                <h2>🕐 Movimientos recientes</h2>
                @if (d.recentMovements.length === 0) {
                    <p class="muted">Sin movimientos registrados.</p>
                } @else {
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tipo</th>
                                <th>Motivo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (m of d.recentMovements; track m.id) {
                                <tr>
                                    <td>
                                        <a [routerLink]="['/admin/movimientos', m.id]">{{ m.id }}</a>
                                    </td>
                                    <td>
                                        <span class="badge" [class]="typeBadge(m.movement_type)">{{
                                            m.movement_type
                                        }}</span>
                                    </td>
                                    <td>{{ m.reason }}</td>
                                    <td>{{ m.created_at | date: 'dd/MM/yyyy HH:mm' }}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                }
            </section>

            <section class="glass-card quick-links">
                <h2>Accesos rápidos</h2>
                <div class="links-row">
                    <a routerLink="/admin/productos/nuevo" class="btn btn-sm">+ Producto</a>
                    <a routerLink="/admin/movimientos/nuevo" class="btn btn-sm">+ Movimiento</a>
                    <a routerLink="/admin/lotes" class="btn btn-secondary btn-sm">Ver Lotes</a>
                    <a routerLink="/admin/proveedores" class="btn btn-secondary btn-sm">Proveedores</a>
                    <a routerLink="/admin/categorias" class="btn btn-secondary btn-sm">Categorías</a>
                </div>
            </section>
        }
    `,
    styles: `
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .kpi-card {
            text-align: center;
        }
        .kpi-icon {
            font-size: 1.5rem;
        }
        .kpi-value {
            font-size: var(--font-size-2xl);
            font-weight: 800;
            margin: 0.5rem 0;
        }
        .kpi-label {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        h2 {
            margin: 0 0 1rem;
            font-size: var(--font-size-lg);
        }
        .alert-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .alert-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--color-border);
        }
        .muted {
            color: var(--color-text-secondary);
        }
        .quick-links .links-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
    `,
})
export class DashboardComponent implements OnInit {
    private readonly dashboardService = inject(DashboardService);
    readonly authService = inject(AuthService);

    loading = signal(true);
    error = signal('');
    data = signal<DashboardData | null>(null);

    ngOnInit(): void {
        this.dashboardService.loadDashboard().subscribe({
            next: (d) => {
                this.data.set(d);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(extractErrorMessage(err, 'No se pudo cargar el dashboard.'));
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
}
