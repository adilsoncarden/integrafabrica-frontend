import { Component, computed, inject, signal } from '@angular/core';
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

    userInitials = computed(() => {
        const username = this.currentUser()?.username ?? '';
        if (!username) {
            return '?';
        }
        const parts = username.split(/[._@-]/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return username.slice(0, 2).toUpperCase();
    });

    userRoleLabel = computed(() => {
        const role = this.currentUser()?.role ?? '';
        if (!role) {
            return 'Usuario';
        }
        return role.replace(/^ROLE_/, '');
    });

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
