export interface MovementDetail {
    id: number;
    movement_id: number;
    product_id: number;
    product_name: string;
    batch_id: number | null;
    batch_code: string | null;
    quantity: number;
}

export interface MovementDetailRequest {
    movement_id: number;
    product_id: number;
    batch_id?: number | null;
    quantity: number;
}
