import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface NavItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmDialogComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    sidebarCollapsed = signal(false);
    userMenuOpen = signal(false);

    readonly navItems: NavItem[] = [
        { label: 'Dashboard', icon: '📊', route: '/admin/dashboard' },
        { label: 'Categorías', icon: '🏷️', route: '/admin/categorias' },
        { label: 'Ubicaciones', icon: '📍', route: '/admin/ubicaciones' },
        { label: 'Proveedores', icon: '🏢', route: '/admin/proveedores' },
        { label: 'Productos', icon: '📦', route: '/admin/productos' },
        { label: 'Lotes', icon: '🧪', route: '/admin/lotes' },
        { label: 'Movimientos', icon: '🔄', route: '/admin/movimientos' },
        { label: 'Detalles Mov.', icon: '📝', route: '/admin/detalles-movimiento' },
    ];

    currentUser = this.authService.currentUser;

    toggleSidebar(): void {
        this.sidebarCollapsed.update((v) => !v);
    }

    toggleUserMenu(): void {
        this.userMenuOpen.update((v) => !v);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
