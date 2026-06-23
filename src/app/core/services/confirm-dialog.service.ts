import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
    visible = signal(false);
    options = signal<ConfirmOptions | null>(null);

    private resolveFn: ((value: boolean) => void) | null = null;

    confirm(options: ConfirmOptions): Promise<boolean> {
        this.options.set({
            confirmLabel: 'Confirmar',
            cancelLabel: 'Cancelar',
            danger: false,
            ...options,
        });
        this.visible.set(true);
        return new Promise<boolean>((resolve) => {
            this.resolveFn = resolve;
        });
    }

    accept(): void {
        this.visible.set(false);
        this.resolveFn?.(true);
        this.resolveFn = null;
    }

    cancel(): void {
        this.visible.set(false);
        this.resolveFn?.(false);
        this.resolveFn = null;
    }
}
