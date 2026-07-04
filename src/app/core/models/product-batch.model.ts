import { Product } from "./product.model";

export interface ProductBatch {
    id: number;
    product: Product;
    batch_code: string;
    expiration_date: string;
    initial_quantity: number;
    current_quantity: number;
    created_at: string;
}

export interface ProductBatchRequest {
    product_id: number;
    batch_code: string;
    expiration_date: string;
    initial_quantity: number;
    current_quantity: number;
}
