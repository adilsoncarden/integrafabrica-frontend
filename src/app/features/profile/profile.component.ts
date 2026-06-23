import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [PageHeaderComponent],
    template: `
        <app-page-header title="Perfil" subtitle="Información de tu sesión" />

        @if (authService.currentUser(); as user) {
            <div class="glass-card profile-card">
                <div class="profile-row">
                    <span class="label">Usuario</span>
                    <span class="value">{{ user.username }}</span>
                </div>
                <div class="profile-row">
                    <span class="label">Rol</span>
                    <span class="value">
                        <span class="badge primary">{{ user.role }}</span>
                    </span>
                </div>
                <div class="profile-row">
                    <span class="label">ID de usuario</span>
                    <span class="value">{{ user.userId }}</span>
                </div>
            </div>
        } @else {
            <div class="alert alert-error">No hay sesión activa.</div>
        }
    `,
    styles: `
        .profile-card {
            max-width: 480px;
        }
        .profile-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--color-border);
        }
        .profile-row:last-child {
            border-bottom: none;
        }
        .label {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            text-transform: uppercase;
            font-weight: 600;
        }
        .value {
            font-weight: 600;
        }
    `,
})
export class ProfileComponent {
    readonly authService = inject(AuthService);
}
