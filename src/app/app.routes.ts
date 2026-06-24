import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guards';
import { authReadyResolver } from './core/resolvers/auth-ready.resolver';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login.component').then(
                (m) => m.LoginComponent,
            ),
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        resolve: { authReady: authReadyResolver },
        loadComponent: () =>
            import('./layouts/main-layout/main-layout.component').then(
                (m) => m.MainLayoutComponent,
            ),
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent,
                    ),
            },
            {
                path: 'categorias',
                loadComponent: () =>
                    import('./features/categories/category-list/category-list.component').then(
                        (m) => m.CategoryListComponent,
                    ),
            },
            {
                path: 'categorias/nuevo',
                loadComponent: () =>
                    import('./features/categories/category-form/category-form.component').then(
                        (m) => m.CategoryFormComponent,
                    ),
            },
            {
                path: 'categorias/:id/editar',
                loadComponent: () =>
                    import('./features/categories/category-form/category-form.component').then(
                        (m) => m.CategoryFormComponent,
                    ),
            },
            {
                path: 'categorias/:id',
                loadComponent: () =>
                    import('./features/categories/category-detail/category-detail.component').then(
                        (m) => m.CategoryDetailComponent,
                    ),
            },
            {
                path: 'ubicaciones',
                loadComponent: () =>
                    import('./features/locations/location-list/location-list.component').then(
                        (m) => m.LocationListComponent,
                    ),
            },
            {
                path: 'ubicaciones/nuevo',
                loadComponent: () =>
                    import('./features/locations/location-form/location-form.component').then(
                        (m) => m.LocationFormComponent,
                    ),
            },
            {
                path: 'ubicaciones/:id/editar',
                loadComponent: () =>
                    import('./features/locations/location-form/location-form.component').then(
                        (m) => m.LocationFormComponent,
                    ),
            },
            {
                path: 'ubicaciones/:id',
                loadComponent: () =>
                    import('./features/locations/location-detail/location-detail.component').then(
                        (m) => m.LocationDetailComponent,
                    ),
            },
            {
                path: 'proveedores',
                loadComponent: () =>
                    import('./features/suppliers/supplier-list/supplier-list.component').then(
                        (m) => m.SupplierListComponent,
                    ),
            },
            {
                path: 'proveedores/nuevo',
                loadComponent: () =>
                    import('./features/suppliers/supplier-form/supplier-form.component').then(
                        (m) => m.SupplierFormComponent,
                    ),
            },
            {
                path: 'proveedores/:id/editar',
                loadComponent: () =>
                    import('./features/suppliers/supplier-form/supplier-form.component').then(
                        (m) => m.SupplierFormComponent,
                    ),
            },
            {
                path: 'proveedores/:id',
                loadComponent: () =>
                    import('./features/suppliers/supplier-detail/supplier-detail.component').then(
                        (m) => m.SupplierDetailComponent,
                    ),
            },
            {
                path: 'productos',
                loadComponent: () =>
                    import('./features/products/product-list/product-list.component').then(
                        (m) => m.ProductListComponent,
                    ),
            },
            {
                path: 'productos/nuevo',
                loadComponent: () =>
                    import('./features/products/product-form/product-form.component').then(
                        (m) => m.ProductFormComponent,
                    ),
            },
            {
                path: 'productos/:id/editar',
                loadComponent: () =>
                    import('./features/products/product-form/product-form.component').then(
                        (m) => m.ProductFormComponent,
                    ),
            },
            {
                path: 'productos/:id',
                loadComponent: () =>
                    import('./features/products/product-detail/product-detail.component').then(
                        (m) => m.ProductDetailComponent,
                    ),
            },
            {
                path: 'lotes',
                loadComponent: () =>
                    import('./features/product-batches/batch-list/batch-list.component').then(
                        (m) => m.BatchListComponent,
                    ),
            },
            {
                path: 'lotes/nuevo',
                loadComponent: () =>
                    import('./features/product-batches/batch-form/batch-form.component').then(
                        (m) => m.BatchFormComponent,
                    ),
            },
            {
                path: 'lotes/:id/editar',
                loadComponent: () =>
                    import('./features/product-batches/batch-form/batch-form.component').then(
                        (m) => m.BatchFormComponent,
                    ),
            },
            {
                path: 'lotes/:id',
                loadComponent: () =>
                    import('./features/product-batches/batch-detail/batch-detail.component').then(
                        (m) => m.BatchDetailComponent,
                    ),
            },
            {
                path: 'movimientos',
                loadComponent: () =>
                    import('./features/movements/movement-list/movement-list.component').then(
                        (m) => m.MovementListComponent,
                    ),
            },
            {
                path: 'movimientos/nuevo',
                loadComponent: () =>
                    import('./features/movements/movement-form/movement-form.component').then(
                        (m) => m.MovementFormComponent,
                    ),
            },
            {
                path: 'movimientos/:id/editar',
                loadComponent: () =>
                    import('./features/movements/movement-form/movement-form.component').then(
                        (m) => m.MovementFormComponent,
                    ),
            },
            {
                path: 'movimientos/:id',
                loadComponent: () =>
                    import('./features/movements/movement-detail/movement-detail.component').then(
                        (m) => m.MovementDetailComponent,
                    ),
            },
            {
                path: 'detalles-movimiento',
                loadComponent: () =>
                    import('./features/movement-details/detail-list/detail-list.component').then(
                        (m) => m.DetailListComponent,
                    ),
            },
            {
                path: 'detalles-movimiento/nuevo',
                loadComponent: () =>
                    import('./features/movement-details/detail-form/detail-form.component').then(
                        (m) => m.DetailFormComponent,
                    ),
            },
            {
                path: 'detalles-movimiento/:id/editar',
                loadComponent: () =>
                    import('./features/movement-details/detail-form/detail-form.component').then(
                        (m) => m.DetailFormComponent,
                    ),
            },
            {
                path: 'detalles-movimiento/:id',
                loadComponent: () =>
                    import('./features/movement-details/detail-detail/detail-detail.component').then(
                        (m) => m.DetailDetailComponent,
                    ),
            },
            {
                path: 'perfil',
                loadComponent: () =>
                    import('./features/profile/profile.component').then(
                        (m) => m.ProfileComponent,
                    ),
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' },
];
