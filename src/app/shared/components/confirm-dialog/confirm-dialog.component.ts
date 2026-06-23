import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    template: `
        @if (dialog.visible()) {
            <div class="overlay" (click)="dialog.cancel()">
                <div class="modal glass-card" (click)="$event.stopPropagation()">
                    <h3>{{ dialog.options()?.title }}</h3>
                    <p>{{ dialog.options()?.message }}</p>
                    <div class="actions">
                        <button type="button" class="btn-secondary" (click)="dialog.cancel()">
                            {{ dialog.options()?.cancelLabel }}
                        </button>
                        <button
                            type="button"
                            [class]="dialog.options()?.danger ? 'btn-danger' : 'btn'"
                            (click)="dialog.accept()"
                        >
                            {{ dialog.options()?.confirmLabel }}
                        </button>
                    </div>
                </div>
            </div>
        }
    `,
    styles: `
        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
        }
        .modal {
            width: 100%;
            max-width: 480px;
            animation: fadeIn 0.2s ease-out;
        }
        h3 {
            margin: 0 0 0.75rem;
        }
        p {
            color: var(--color-text-secondary);
            margin: 0 0 1.5rem;
        }
        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }
    `,
})
export class ConfirmDialogComponent {
    dialog = inject(ConfirmDialogService);
}
