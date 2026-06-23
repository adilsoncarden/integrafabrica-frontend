import { Supplier } from './supplier.model';

export interface Movement {
    id: number;
    movement_type: string;
    reason: string;
    supplier: Supplier | null;
    reference_document_type: string | null;
    reference_document_number: string | null;
    performed_by_user: string;
    created_at: string;
}

export interface MovementRequest {
    movement_type: string;
    reason: string;
    supplier_id?: number | null;
    reference_document_type?: string | null;
    reference_document_number?: string | null;
    performed_by?: number | null;
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'MERMA';
