import { Category } from './category.model';
import { Location } from './location.model';

export interface Product {
    id: number;
    sku: string;
    name: string;
    category: Category;
    location: Location;
    unit: string;
    stock: number;
    minStock: number;
    createdAt: string;
}

export interface ProductRequest {
    sku: string;
    name: string;
    categoryId: number;
    locationId: number;
    unit: string;
    stock: number;
    minStock: number;
}
