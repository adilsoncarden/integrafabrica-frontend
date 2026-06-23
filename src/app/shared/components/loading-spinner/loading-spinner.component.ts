import { Component } from '@angular/core';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    template: `
        <div class="loading-wrap">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>
    `,
    styles: `
        .loading-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--color-text-secondary);
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--color-accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `,
})
export class LoadingSpinnerComponent {}
