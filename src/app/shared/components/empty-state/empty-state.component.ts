import { Component, input } from '@angular/core';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    template: `
        <div class="empty-state">
            <span class="icon">{{ icon() }}</span>
            <h3>{{ title() }}</h3>
            <p>{{ message() }}</p>
            <ng-content />
        </div>
    `,
    styles: `
        .empty-state {
            text-align: center;
            padding: 3rem 1.5rem;
            color: var(--color-text-secondary);
        }
        .icon {
            font-size: 2.5rem;
            display: block;
            margin-bottom: 1rem;
        }
        h3 {
            color: var(--color-text-primary);
            margin: 0 0 0.5rem;
        }
        p {
            margin: 0 0 1rem;
        }
    `,
})
export class EmptyStateComponent {
    icon = input('📭');
    title = input('Sin registros');
    message = input('No hay datos para mostrar.');
}
