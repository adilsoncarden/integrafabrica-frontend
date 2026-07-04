import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

@Injectable({ providedIn: "root" })
export class ConfirmDialogService {
    confirm(options: ConfirmOptions): Promise<boolean> {
        return Swal.fire({
            title: options.title,
            text: options.message,
            icon: options.danger ? "warning" : "question",
            showCancelButton: true,
            confirmButtonText: options.confirmLabel ?? "Confirmar",
            cancelButtonText: options.cancelLabel ?? "Cancelar",
            confirmButtonColor: options.danger ? "#dc2626" : "#4f46e5",
            cancelButtonColor: "#64748b",
            reverseButtons: true,
            focusCancel: !!options.danger,
            customClass: {
                popup: "wms-swal-popup",
                title: "wms-swal-title",
                htmlContainer: "wms-swal-text",
                confirmButton: "wms-swal-confirm",
                cancelButton: "wms-swal-cancel",
            },
        }).then((result) => result.isConfirmed);
    }
}
