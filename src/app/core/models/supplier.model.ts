export interface Supplier {
    id: number;
    ruc: string;
    company_name: string;
    contact_name: string;
    phone: string;
    email: string;
    delivery_time_days: number;
    created_at: string;
}

export interface SupplierRequest {
    ruc: string;
    company_name: string;
    contact_name: string;
    phone?: string;
    email?: string;
    delivery_time_days?: number;
}
